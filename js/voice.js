// 语音输入封装（基于 Web Speech API）
(function() {
  const Voice = {
    recognition: null,
    isListening: false,
    onResult: null,
    onEnd: null,
    onError: null,

    isSupported() {
      return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    },

    start(options = {}) {
      if (!this.isSupported()) {
        if (this.onError) this.onError('当前浏览器不支持语音输入，请使用 Chrome / Edge / Safari');
        return false;
      }
      if (this.isListening) {
        this.stop();
        return false;
      }

      const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new Recog();
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      let finalText = '';
      let interimText = '';

      this.recognition.onresult = (event) => {
        interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }
        if (this.onResult) this.onResult(finalText + interimText, !interimText);
      };

      this.recognition.onerror = (event) => {
        console.warn('语音识别错误:', event.error);
        this.isListening = false;
        if (this.onError) this.onError(this.errMsg(event.error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEnd) this.onEnd(finalText);
      };

      try {
        this.recognition.start();
        this.isListening = true;
        return true;
      } catch (e) {
        this.isListening = false;
        if (this.onError) this.onError('启动语音失败：' + e.message);
        return false;
      }
    },

    stop() {
      if (this.recognition && this.isListening) {
        try { this.recognition.stop(); } catch (e) {}
      }
      this.isListening = false;
    },

    errMsg(code) {
      const map = {
        'no-speech': '没有听到声音，请再说一次',
        'audio-capture': '无法访问麦克风，请检查权限',
        'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许',
        'network': '网络错误，请检查连接'
      };
      return map[code] || ('识别失败：' + code);
    }
  };

  window.Voice = Voice;
})();