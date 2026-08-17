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
};
