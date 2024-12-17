window.AudioContext = window.AudioContext || window.webkitAudioContext;
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}
if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
        let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
}

let mediaRecorder;
let audioChunks = [];
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const audioPlayback = document.getElementById('audioPlayback');


startButton.addEventListener('click', async () => {
    try {
        // 请求访问用户的音频输入设备（麦克风）
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 成功获取到流，可以在这里进一步处理
        console.log('成功获取到媒体流:', stream);
        
        // 创建 MediaRecorder 实例，用于捕获和记录来自 MediaStream 的音频和视频数据，实现网页上的实时音频或视频录制功能
        // stream 通常是通过 navigator.mediaDevices.getUserMedia() 方法获取的 MediaStream 对象，它代表了用户的音频或视频输入（或者两者都有）
        // 返回 MediaRecorder 提供了开始记录、停止记录、获取已记录的数据等方法
        mediaRecorder = new MediaRecorder(stream);
 
        // 监听数据可用事件
        mediaRecorder.ondataavailable = event => {
            // 获取并记录音频数据的 Blob 对象
            // Blob（Binary Large Object）是二进制大型对象的缩写，通常用于表示不可变、原始数据的类文件对象
            // Opus是一个有损声音编码的格式，由Xiph.Org基金会开发，Opus格式的文件可以作为Blob对象来处理。但Blob本身并不表示音频数据的格式，它只是表示二进制数据的一种方式。因此，在处理Blob对象时，我们需要知道它所包含数据的具体格式（如Opus），以便正确地解析和处理它。
            //将提取出来的音频文件使用支持Opus编码的转换工具或软件重新编码为Opus格式。在转换过程中，可能需要设置一些参数，如比特率、采样率等，以满足特定的音质需求。

            audioChunks.push(event.data);
        };
 
        // 监听停止事件
        mediaRecorder.onstop = () => {
            // 创建 Blob 对象，示例中使用了 audio/wav 格式，这可能会生成较大的文件。根据需求，你可以更改格式
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

            const audioUrl = URL.createObjectURL(audioBlob);

            // 设置音频元素的 src 属性
            audioPlayback.src = audioUrl;
 
            // 重置按钮状态
            startButton.disabled = false;
            stopButton.disabled = true;
        };
 
        // 开始录音
        mediaRecorder.start();
 
        // 更新按钮状态
        startButton.disabled = true;
        stopButton.disabled = false;
    } catch (err) {
        console.error('Error accessing media devices.', err);
    }
});

stopButton.addEventListener('click', () => {
    // 停止录音
    mediaRecorder.stop();
});

