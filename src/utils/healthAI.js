/**
 * Anthropic Messages API for flood-context health triage.
 * Requires REACT_APP_ANTHROPIC_API_KEY. Browser calls may be blocked by CORS;
 * use a same-origin proxy in production if needed.
 */

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are an emergency health advisor for Bangladesh flood disaster response.
Give concise, practical first-aid advice. Always recommend professional medical care for serious symptoms. Consider flood-specific diseases like cholera, typhoid, leptospirosis.
Format: {advice: string, severity: 'Low'|'Medium'|'High', action: string} as JSON only.
Use action exactly one of: rest | clinic | emergency (rest = monitor at home; clinic = see a doctor soon; emergency = call 999 / ER now).
Output raw JSON only — no markdown, no code fences, no extra text.`;

const DURATION_LABELS = {
  '': 'not specified',
  lt24: 'less than 24 hours',
  d1_3: '1–3 days',
  gt3: 'more than 3 days',
  unsure: 'unclear / not sure',
};

const AGE_LABELS = {
  '': 'not specified',
  u5: 'under 5',
  '5_17': '5–17',
  '18_39': '18–39',
  '40_64': '40–64',
  '65p': '65+',
};

/** ---- Local fallback (symptom rules) — used when API fails or key missing ---- */

const SYMPTOM_ADVICE_RESPONSES = [
  {
    match: (s) => s.has('Drowning'),
    en: 'Possible drowning or near-drowning: ensure the person is safe and out of the water. If not breathing normally, shout for help and start rescue breaths if trained. If unresponsive and not breathing, begin CPR per local protocol and call 999 immediately. Keep the person warm; do not delay emergency care.',
    bn: 'ডুব বা প্রায়-ডুব: ব্যক্তিকে নিরাপদ স্থানে নিয়ে আসুন। স্বাভাবিক শ্বাস না হলে সাহায্য চান। সচেতন নেই ও শ্বাস নেই তবে সিপিআর দিন এবং অবিলম্বে ৯৯৯-এ কল করুন।',
    severity: 'High',
    action: 'emergency',
  },
  {
    match: (s) => s.has('Snake bite'),
    en: 'Treat as a time-critical envenomation risk: keep calm and still, remove tight items near the bite, immobilize the limb at heart level, and do not cut or suck the wound. Seek immediate hospital care — call 999 / 199 if needed.',
    bn: 'সাপের কামড়: শান্ত রাখুন, কামড়ের কাছে আঁটো জিনিস খুলে দিন, অঙ্গ স্থির রাখুন। কাটা বা চোষা যাবে না। অবিলম্বে হাসপাতালে যান — ৯৯৯/১৯৯।',
    severity: 'High',
    action: 'emergency',
  },
  {
    match: (s) => s.has('Difficulty breathing') || s.has('Chest pain'),
    en: 'Chest pain or breathing difficulty may be an emergency. Stop activity, sit leaning slightly forward if it helps breathing, and call 999 now. Do not drive yourself.',
    bn: 'বুকে ব্যথা বা শ্বাসকষ্ট জরুরি হতে পারে। কাজ বন্ধ করুন, প্রয়োজনে সামান্য এগিয়ে বসুন এবং এখনই ৯৯৯-এ কল করুন।',
    severity: 'High',
    action: 'emergency',
  },
  {
    match: (s) => s.has('Fever') && s.has('Diarrhea'),
    en: 'Fever with diarrhea after flooding suggests waterborne illness risk. Use safe water, oral rehydration in small sips, and hand hygiene. Seek same-day care for blood in stool, persistent vomiting, confusion, or dehydration.',
    bn: 'জ্বর ও পাতলা পায়খানায় পানিবাহিত রোগের ঝুঁকি। নিরাপদ পানি, ORS ও হাত ধোয়া। রক্তযুক্ত পায়খানা, বমি, বিভ্রান্তি বা পানিশূন্যতায় আজই চিকিৎসক।',
    severity: 'Medium',
    action: 'clinic',
  },
  {
    match: (s) => s.has('Waterborne illness'),
    en: 'Suspected waterborne illness: avoid untreated water, rehydrate with ORS, simple foods as tolerated. Visit a clinic if symptoms persist beyond 48 hours or worsen.',
    bn: 'পানিবাহিত অসুস্থতা সন্দেহ: অপরিশোধিত পানি এড়ান, ORS নিন। ৪৮ ঘণ্টার বেশি বা অবনতি হলে ক্লিনিকে যান।',
    severity: 'Medium',
    action: 'clinic',
  },
  {
    match: (s) => s.has('Injury'),
    en: 'Control bleeding with pressure and clean dressing, immobilize suspected fractures. Seek emergency care for heavy bleeding, open fractures, head injury with confusion, or penetrating wounds.',
    bn: 'রক্তপাত চাপ দিয়ে নিয়ন্ত্রণ করুন, ভাঙা সন্দেহে স্থির রাখুন। প্রচুর রক্তপাত বা মাথায় আঘাতে জরুরি সেবা।',
    severity: 'Medium',
    action: 'clinic',
  },
  {
    match: (s) => s.has('Vomiting') || s.has('Diarrhea') || s.has('Fever'),
    en: 'Hydrate with ORS and safe water, monitor closely. Escalate to a clinic if severe, lasting more than two days, or signs of dehydration.',
    bn: 'ORS ও নিরাপদ পানি, পর্যবেক্ষণ করুন। তীব্র, দুই দিনের বেশি বা পানিশূন্যতায় ক্লিনিকে যান।',
    severity: 'Medium',
    action: 'clinic',
  },
  {
    match: () => true,
    en: 'General flood health: safe drinking water, hand washing, avoid contaminated water with open wounds. Rest, hydrate, and seek care if symptoms worsen.',
    bn: 'বন্যাকালীন: নিরাপদ পানি, হাত ধোয়া, খোলা ক্ষতে দূষিত পানি এড়ান। বিশ্রাম ও তরল; অবনতি হলে চিকিৎসা।',
    severity: 'Low',
    action: 'rest',
  },
];

function durationHintEn(key) {
  switch (key) {
    case 'lt24':
      return 'Symptoms are recent.';
    case 'd1_3':
      return 'Symptoms have persisted for a couple of days — track changes closely.';
    case 'gt3':
      return 'Longer duration increases the need for a clinical review.';
    case 'unsure':
      return 'If timing is unclear, it is safer to seek guidance sooner.';
    default:
      return '';
  }
}

function durationHintBn(key) {
  switch (key) {
    case 'lt24':
      return 'লক্ষণগুলো সাম্প্রতিক।';
    case 'd1_3':
      return 'কয়েক দিন ধরে লক্ষণ থাকলে পরিবর্তনগুলো নজরে রাখুন।';
    case 'gt3':
      return 'দীর্ঘ সময় ধরে থাকলে চিকিৎসকের পরামর্শ গুরুত্বপূর্ণ।';
    case 'unsure':
      return 'সময় নিশ্চিত না হলে দ্রুত পরামর্শ নিন।';
    default:
      return '';
  }
}

function ageHintEn(key) {
  switch (key) {
    case 'u5':
      return 'Children under five dehydrate quickly — use extra caution.';
    case '5_17':
      return 'For children and teens, watch alertness and fluid intake.';
    case '40_64':
      return 'Adults in this range should monitor chronic conditions if present.';
    case '65p':
      return 'Older adults may worsen faster — lower the threshold to seek care.';
    default:
      return '';
  }
}

function ageHintBn(key) {
  switch (key) {
    case 'u5':
      return '৫ বছরের কম বয়সী শিশুরা দ্রুত পানিশূন্যতায় পড়তে পারে।';
    case '5_17':
      return 'কিশোর-কিশোরীদের সচেতনতা ও তরল গ্রহণ লক্ষ্য রাখুন।';
    case '40_64':
      return 'দীর্ঘমেয়াদি রোগ থাকলে সতর্ক থাকুন।';
    case '65p':
      return 'বয়স্কদের অবস্থা দ্রুত খারাপ হতে পারে — তাড়াতাড়ি চিকিৎসা নিন।';
    default:
      return '';
  }
}

function pickAdviceFromSymptoms(symptomList) {
  const selected = new Set(symptomList);
  const row = SYMPTOM_ADVICE_RESPONSES.find((r) => r.match(selected));
  return {
    en: row.en,
    bn: row.bn,
    severity: row.severity,
    action: row.action,
  };
}

export function buildLocalFallbackAdvice(symptoms, description, durationKey, ageKey) {
  const base =
    symptoms.length > 0
      ? pickAdviceFromSymptoms(symptoms)
      : pickAdviceFromSymptoms([]);

  const dEn = durationHintEn(durationKey);
  const dBn = durationHintBn(durationKey);
  const aEn = ageHintEn(ageKey);
  const aBn = ageHintBn(ageKey);

  const extraEn = [dEn, aEn].filter(Boolean).join(' ');
  const extraBn = [dBn, aBn].filter(Boolean).join(' ');
  const descEn = description?.trim()
    ? ` Notes from patient: ${description.trim()}`
    : '';
  const descBn = description?.trim()
    ? ` রোগীর বর্ণনা: ${description.trim()}`
    : '';

  return {
    ...base,
    en: `${extraEn ? `${base.en} ${extraEn}` : base.en}${descEn}`,
    bn: `${extraBn ? `${base.bn} ${extraBn}` : base.bn}${descBn}`,
    source: 'fallback',
  };
}

function buildUserMessage({ symptoms, duration, age, description }) {
  const symptomStr = Array.isArray(symptoms)
    ? symptoms.filter(Boolean).join(', ') || 'none selected'
    : String(symptoms || 'none selected');
  const dur = DURATION_LABELS[duration] ?? duration ?? 'not specified';
  const ageStr = AGE_LABELS[age] ?? age ?? 'not specified';
  let msg = `Patient symptoms: ${symptomStr}. Duration: ${dur}. Age: ${ageStr}.`;
  if (description?.trim()) {
    msg += ` Additional notes: ${description.trim()}`;
  }
  return msg;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

function normalizeSeverity(raw) {
  const s = String(raw || '').toLowerCase();
  if (s === 'high') return 'High';
  if (s === 'medium' || s === 'moderate') return 'Medium';
  return 'Low';
}

function normalizeAction(raw) {
  const a = String(raw || '').toLowerCase();
  if (a.includes('emergency') || a === 'er' || a === '999') return 'emergency';
  if (a.includes('clinic') || a.includes('doctor') || a.includes('hospital')) return 'clinic';
  if (a.includes('rest') || a.includes('home') || a.includes('monitor')) return 'rest';
  return 'clinic';
}

function parseAdviceJson(text) {
  const jsonStr = extractJsonObject(text);
  if (!jsonStr) return null;
  try {
    const o = JSON.parse(jsonStr);
    if (!o || typeof o.advice !== 'string') return null;
    return {
      advice: o.advice.trim(),
      severity: normalizeSeverity(o.severity),
      action: normalizeAction(o.action),
    };
  } catch {
    return null;
  }
}

/**
 * @param {{ symptoms: string[]; duration: string; age: string; description?: string }} params
 * @returns {Promise<{ en: string; bn: string; severity: string; action: string; source: 'api'|'fallback' }>}
 */
export async function getHealthAdvice({ symptoms, duration, age, description }) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ...buildLocalFallbackAdvice(symptoms, description, duration, age),
      source: 'fallback',
    };
  }

  try {
    const res = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildUserMessage({ symptoms, duration, age, description }),
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const block = data?.content?.find((c) => c.type === 'text');
    const text = block?.text ?? '';
    const parsed = parseAdviceJson(text);

    if (!parsed) {
      throw new Error('Could not parse model JSON');
    }

    const advice = parsed.advice;
    return {
      en: advice,
      bn: advice,
      severity: parsed.severity,
      action: parsed.action,
      source: 'api',
    };
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getHealthAdvice]', e);
    }
    return {
      ...buildLocalFallbackAdvice(symptoms, description, duration, age),
      source: 'fallback',
    };
  }
}
