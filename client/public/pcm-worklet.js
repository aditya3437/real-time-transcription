class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
    this.buffer = [];
    this.ratio = sampleRate / 16000;
  }
  process(inputs) {
    const channels = inputs[0];
    if (!channels?.length) return true;
    const mono = channels.length > 1
      ? channels[0].map((sample, index) => (sample + channels[1][index]) * 0.5)
      : channels[0];
    for (const sample of mono) {
      this.phase += 1;
      if (this.phase >= this.ratio) {
        this.phase -= this.ratio;
        this.buffer.push(Math.max(-1, Math.min(1, sample)));
      }
    }
    if (this.buffer.length >= 2048) {
      const pcm = new Int16Array(this.buffer.length);
      for (let i = 0; i < pcm.length; i++) pcm[i] = Math.round(this.buffer[i] * (this.buffer[i] < 0 ? 32768 : 32767));
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
      this.buffer = [];
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCaptureProcessor);
