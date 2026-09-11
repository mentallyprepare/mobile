// Hindi translations. Reviewed with a fluent speaker before shipping to
// production — a shipped bad translation is worse than an English fallback.
//
// Kept to short, natural phrasings that match the app's low, quiet tone;
// avoids formal register (आप) where a peer-facing app is expected. Every
// key defined in StringsShape must have a Hindi value here; the TypeScript
// compiler will fail if any is missing.

import type { StringsShape } from './types';

export const hi: StringsShape = {
  support: {
    back: '← वापस',
    heading: 'सहायता',
    title: 'अगर आज रात भारी है।',
    ifUnsafe:
      'अगर आप अभी सुरक्षित नहीं महसूस कर रहे — तुरंत स्थानीय आपातकालीन सेवा, किसी विश्वसनीय व्यक्ति, या क्राइसिस हेल्पलाइन से संपर्क करें।',
    india: 'भारत',
    us_canada: 'अमेरिका और कनाडा',
    uk_ireland_europe: 'यूके, आयरलैंड और यूरोप',
    anywhere_else: 'कहीं और',
    call: 'कॉल करें',
    text: 'मैसेज',
    open_link: 'खोलें',
    directory_description: 'सत्यापित हेल्पलाइन, देश के अनुसार।',
    what_this_is_title: 'यह क्या है।',
    not_service:
      'Mentally Prepare वयस्कों के लिए एक अनाम लेखन और सहकर्मी संपर्क ऐप है। यह चिकित्सा, परामर्श, या क्राइसिस लाइन नहीं है।',
    human_review:
      'आपकी नोट्स डिफ़ॉल्ट रूप से निजी हैं। कोई इंसान उन्हें तब तक नहीं पढ़ता जब तक कि रिपोर्ट न हो, या गंभीर सुरक्षा जोखिम न हो।',
  },
  sign_in: {
    screen_label: 'निजी 21 रातों का सफ़र',
    title: 'फिर से स्वागत है।',
    sub: 'उस जगह लौटें जो आप बना रहे हैं।',
    email_label: 'ईमेल',
    email_placeholder: 'you@college.edu',
    email_a11y: 'ईमेल',
    password_label: 'पासवर्ड',
    password_a11y: 'पासवर्ड',
    forgot: 'पासवर्ड भूल गए?',
    forgot_a11y: 'पासवर्ड भूल गए',
    submit: 'साइन इन करें',
    submit_busy: 'साइन इन हो रहा है…',
    create_eyebrow: 'Mentally Prepare में नए हैं?',
    create_label: 'अपना अकाउंट बनाएं',
    create_a11y: 'अकाउंट बनाएं',
    privacy_note: '18+ · डिफ़ॉल्ट रूप से निजी · कोई सार्वजनिक फ़ीड नहीं',
    support_link: 'अगर आज रात भारी है, सहायता खोजें',
    support_a11y: 'सहायता खोजें',
    support_hint: 'क्षेत्र के अनुसार क्राइसिस हेल्पलाइन',
  },
  small_wins: {
    tap_hint: 'जारी रखने के लिए टैप करें',
    close: 'हो गया',
    recognition_title: 'आज तुम अपने लिए\nमौजूद रहे।',
    tonights_win_label: 'आज रात की जीत',
    night_label: 'रात',
    of_total: '21 में से',
    consent_title: 'क्या यह जीत अपने\nसाथी के साथ साझा करें?',
    your_win_label: 'आपकी जीत',
    consent_lock: 'सिर्फ़ यह संदेश साझा होगा। आपकी डायरी निजी रहती है।',
    share_cta: 'साथी के साथ साझा करें',
    keep_cta: 'निजी रखें',
    shared_title: 'आपके साथी ने\nआपकी जीत देखी।',
    shared_body: 'कोई स्कोर नहीं। कोई दबाव नहीं। बस देखा गया।',
    reaction_label: 'तुम पर गर्व है',
    kept_title: 'यह सिर्फ़\nतुम्हारी रही।',
    kept_body: 'किसी और को इसे देखने की ज़रूरत नहीं। तारा अब भी तुम्हारी कक्षा में है।',
    m1_kicker: 'रात 1',
    m1_title: 'पहली रात।',
    m1_body: 'एक पूरी। हर लंबी चीज़ ऐसे ही शुरू होती है — चुपचाप।',
    m3_kicker: 'रात 3',
    m3_title: 'तीन रातें पूरी।',
    m3_body: 'शुरू करना सबसे कठिन था। तुम उससे आगे निकल चुके हो।',
    m7_kicker: 'रात 7',
    m7_title: 'एक हफ़्ता हो गया।',
    m7_body: 'तुमने सबसे छोटा वादा सात बार निभाया।',
    m14_kicker: 'रात 14',
    m14_title: 'दो-तिहाई सफ़र।',
    m14_body: 'चौदह रातें पीछे। सात बाकी।',
    m20_kicker: 'रात 20',
    m20_title: 'बस एक और रात।',
    m20_body: 'कल खुलासा खुलता है। आज की रात अब भी सिर्फ़ तुम्हारी है।',
    m21_kicker: 'रात 21',
    m21_title: 'इक्कीस रातें।',
    m21_body: 'तुम हर रात यहाँ थे। अब खुलासा तुम्हारी पसंद है।',
  },
};
