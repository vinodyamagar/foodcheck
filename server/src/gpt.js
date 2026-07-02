// Lazy-initialized text generation using transformers.js
// Default model: Xenova/distilgpt2 (instruction-untuned; we ground with facts)

let pipelinePromise = null;

async function getPipeline() {
  if (pipelinePromise) return pipelinePromise;
  const modelId = process.env.MODEL_ID || 'Xenova/distilgpt2';
  pipelinePromise = (async () => {
    const { pipeline } = await import('@xenova/transformers');
    return await pipeline('text-generation', modelId);
  })();
  return pipelinePromise;
}

async function generateWithLocal(prompt, options = {}) {
  const pipe = await getPipeline();
  const out = await pipe(prompt, {
    max_new_tokens: options.max_new_tokens || 120,
    temperature: options.temperature ?? 0.7,
    top_k: options.top_k || 50,
    repetition_penalty: options.repetition_penalty || 1.1,
    do_sample: true,
  });
  const text = Array.isArray(out) ? out[0]?.generated_text || '' : String(out);
  return text;
}

async function generateWithHF(prompt, options = {}) {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  const modelId = process.env.MODEL_ID || 'Xenova/distilgpt2';
  if (!token) throw new Error('HUGGINGFACE_API_TOKEN not set');
  const body = { inputs: prompt, parameters: { max_new_tokens: options.max_new_tokens || 120, temperature: options.temperature ?? 0.7 } };
  const resp = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}` , {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error(`HF Inference API error: ${resp.status}`);
  const data = await resp.json();
  let text = '';
  if (Array.isArray(data) && data[0] && data[0].generated_text) {
    text = data[0].generated_text;
  } else if (data.generated_text) {
    text = data.generated_text;
  } else if (Array.isArray(data) && data[0] && data[0].summary_text) {
    text = data[0].summary_text;
  } else {
    text = JSON.stringify(data);
  }
  return text;
}

async function generateAdvice(prompt, options = {}) {
  // Prefer local if available; optionally force HF with USE_HF_INFERENCE=1
  if (process.env.USE_HF_INFERENCE === '1') {
    return generateWithHF(prompt, options);
  }
  try {
    return await generateWithLocal(prompt, options);
  } catch (e) {
    if (process.env.HUGGINGFACE_API_TOKEN) {
      return await generateWithHF(prompt, options);
    }
    throw e;
  }
}

module.exports = { generateAdvice };
