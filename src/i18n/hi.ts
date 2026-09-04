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
  reveal: {
    kicker: 'दिन 21',
    back_a11y: 'वापस',
    not_yet_title: 'इक्कीसवीं रात को रिवील खुलता है।',
    not_yet_body:
      'रात 21 की नोट सील करने के बाद वापस आएं। तब तक यह चुनाव सामने नहीं आएगा।',
    choose_title: 'तय करें कि आप क्या साझा करना चाहते हैं।',
    choose_body:
      'आप दोनों अलग-अलग तय करते हैं। अगर कोई भी एक अनाम रहना चुनता है, किसी की भी पहचान सामने नहीं आती। सबमिट के बाद चुनाव लॉक हो जाता है।',
    choice_stay_anonymous_short: 'अनाम रहूं',
    choice_stay_anonymous_long:
      'आप दोनों में से कोई नहीं जान पाएगा कि दूसरा कौन था। यह साझेदारी निजी रहेगी।',
    choice_first_name_short: 'सिर्फ़ पहला नाम साझा करूं',
    choice_first_name_long: 'बस आपका पहला नाम। और कुछ नहीं।',
    choice_name_college_short: 'नाम और कॉलेज साझा करूं',
    choice_name_college_long: 'पूरा नाम, कॉलेज, और आपका साल। ईमेल नहीं।',
    choice_contact_details_short: 'संपर्क विवरण साझा करूं',
    choice_contact_details_long:
      'पूरा नाम, कॉलेज, साल, और ईमेल — ताकि आप बाद में एक-दूसरे तक पहुंच सकें।',
    waiting_title_prefix: 'आपने चुना ',
    waiting_title_suffix: '।',
    waiting_body:
      'दूसरे व्यक्ति के अपना चुनाव करने का इंतज़ार है। जब वे तय करेंगे, यह स्क्रीन खुद अपडेट हो जाएगी — या अगली बार आने पर।',
    waiting_locked: 'आपका चुनाव लॉक हो चुका है।',
    anonymous_title: 'यह साझेदारी निजी रहेगी।',
    anonymous_body:
      'आप दोनों में से एक ने अनाम रहना चुना। किसी की पहचान सामने नहीं आएगी। इक्कीस रातें आपकी अपनी रहेंगी।',
    revealed_title: 'हैलो कहें।',
    partner_card_label: 'आपका साथी थे',
    partner_email_a11y_prefix: 'संपर्क ईमेल ',
    unsent_letter_label: 'भेजा नहीं गया पत्र',
    settling_title: 'आप दोनों ने चुन लिया है।',
    settling_body:
      'रिवील अभी सेटल हो रहा है। अगली बार आने पर यह स्क्रीन अपडेट हो जाएगी।',
  },
  sign_up_explainer: {
    kicker: 'अनाम रहने का मतलब',
    title: 'एक छोटा, ईमानदार वादा।',
    intro:
      'आपका नाम और ईमेल मांगने से पहले — यह ऐप उनके साथ क्या करता है और क्या नहीं, यहाँ बता रहे हैं।',
    promise1_title: 'आपका नाम और ईमेल किसी दूसरे यूज़र को कभी नहीं दिखाए जाते।',
    promise1_body:
      'ये आपके अकाउंट पर साइन-इन, पासवर्ड रीसेट और डेटा एक्सपोर्ट के लिए रहते हैं। कोई प्रोफ़ाइल इन्हें नहीं दिखाती।',
    promise2_title: 'आपका साथी कभी नहीं जानता कि आप कौन हैं।',
    promise2_body:
      '21 रातों तक आप दोनों अनाम रूप से लिखते हैं। दिन 21 को आप दोनों अलग-अलग तय करते हैं कि क्या साझा करना है — अनाम रहने से लेकर संपर्क विवरण साझा करने तक। अगर कोई भी एक अनाम चुनता है, किसी की पहचान सामने नहीं आती।',
    promise3_title: 'कॉलेज और साल सिर्फ़ आपको मैच करने के लिए इस्तेमाल होते हैं।',
    promise3_body:
      'ये किसी प्रोफ़ाइल पर नहीं दिखते। जब तक आप बाद में सहमति न दें, हम आपको आपके ही स्कूल के किसी व्यक्ति के साथ जोड़ने से बचते हैं।',
    promise4_title: 'आप कभी भी सब कुछ हटा सकते हैं।',
    promise4_body:
      'साइन इन करें, Safety & Privacy पर जाएं, Delete दबाएं। आपका अकाउंट और हर एंट्री हमारे सर्वर से हटा दी जाती है।',
    footnote:
      'यह ऐप 18+ वयस्कों के लिए है। यह थेरेपी, चिकित्सा, या क्राइसिस लाइन नहीं है — अगर आज रात असुरक्षित महसूस हो, Support स्क्रीन पर क्षेत्र के अनुसार हेल्पलाइन हैं।',
    continue: 'मैं समझ गया — आगे बढ़ें',
    not_now: 'अभी नहीं',
  },
  sign_up: {
    back: '← वापस',
    eyebrow_prefix: 'अकाउंट बनाएं · ',
    eyebrow_suffix: ' / 3',
    step1_title: 'आपसे शुरुआत।',
    step2_title: 'अपनी सीमाएं तय करें।',
    step3_title: 'साफ़ मन से चुनें।',
    step1_intro: 'एक निजी अकाउंट बनाएं जिस पर आप लौट सकें।',
    step2_intro:
      'ये विवरण परिचय को प्रासंगिक और सम्मानजनक रखने में मदद करते हैं।',
    step3_intro: 'अकाउंट बनाने से पहले आपकी उम्र और सहमति ज़रूरी है।',
    name_label: 'आपका नाम',
    name_placeholder: 'जो नाम हम इस्तेमाल करें',
    email_label: 'ईमेल',
    email_placeholder: 'you@college.edu',
    password_label: 'पासवर्ड',
    password_placeholder: 'कम से कम 8 अक्षर',
    confirm_label: 'पासवर्ड दोहराएं',
    confirm_placeholder: 'अपना पासवर्ड फिर लिखें',
    college_label: 'कॉलेज या यूनिवर्सिटी',
    college_placeholder: 'आप कहाँ पढ़ते हैं',
    year_label: 'मौजूदा साल',
    gender_label: 'मैं खुद को बताता/बताती हूं',
    match_gender_label: 'मैं इनसे मिलने में सहज हूं',
    age_title: 'मैं 18 या उससे बड़ा/बड़ी हूं',
    age_body: 'Mentally Prepare अभी सिर्फ़ वयस्कों के लिए है।',
    consent_title: 'मैं शर्तों और प्राइवेसी पॉलिसी से सहमत हूं',
    consent_body:
      'मैं समझता/समझती हूं कि मेरी अकाउंट जानकारी कैसे इस्तेमाल होती है और मैं इसे कैसे एक्सपोर्ट या डिलीट कर सकता/सकती हूं।',
    read_terms: 'शर्तें पढ़ें',
    read_privacy: 'प्राइवेसी पॉलिसी पढ़ें',
    account_exists_title: 'आपका अकाउंट पहले से है।',
    account_exists_body:
      'आपकी जानकारी सुरक्षित है। साइन इन करें, पासवर्ड रीसेट करें, या दूसरा ईमेल इस्तेमाल करने के लिए पहले चरण पर लौटें।',
    continue: 'आगे बढ़ें',
    sign_in_instead: 'इसके बजाय साइन इन करें',
    reset_password: 'मेरा पासवर्ड रीसेट करें',
    use_different_email: 'दूसरा ईमेल इस्तेमाल करें',
    creating: 'आपका अकाउंट बन रहा है…',
    create_account: 'मेरा अकाउंट बनाएं',
    already_have: 'पहले से अकाउंट है? साइन इन करें',
  },
  rooms: {
    opening: 'आपका कमरा खुल रहा है',
    setup_label: 'रात एक से पहले',
    setup_title: 'कमरे में अपनी तरफ़ तैयार करें।',
    setup_body:
      'आपका पैटर्न और कल्चरल शेल्फ़ भविष्य के मैच को असली संदर्भ देते हैं। यह ऐप कभी कोई साथी, नोट, या कनेक्शन नहीं गढ़ता।',
    setup1_title: 'अपना पैटर्न पूरा करें',
    setup1_detail: 'ग्यारह विचारशील, ग़ैर-निदानात्मक सवाल',
    setup2_title: 'अपना कल्चरल शेल्फ़ बनाएं',
    setup2_detail: 'गाने, फ़िल्म, किताब, और एक याद',
    setup3_title: 'अपना दिन 1 लिखें',
    setup3_detail: 'यह पहली नोट बनती है जो आपका मैच पढ़ता है',
    reveal_a11y_locked: 'दिन 21 रिवील खोलें — आपका चुनाव लॉक है',
    reveal_a11y_choose: 'दिन 21 रिवील खोलें — तय करें क्या साझा करना है',
    reveal_title_open: 'रिवील खुल गया है।',
    reveal_title_chose: 'आपने चुन लिया। दूसरे व्यक्ति का इंतज़ार है।',
    reveal_title_choose: 'तय करें कि आप क्या साझा करना चाहते हैं।',
    reveal_body_open: 'साझेदारी देखी जा सकती है।',
    reveal_body_chose:
      'चुनाव लॉक है। आपके साथी के चुनने पर यह स्क्रीन अपडेट हो जाएगी।',
    reveal_body_choose:
      'आप दोनों अलग-अलग तय करते हैं। कोई भी एक अनाम, तो दोनों निजी रहते हैं।',
    sealed_label: 'लोकल और आपके अकाउंट पर सील',
    sealed_title: 'आपकी नोट एक तारा बन गई।',
    sealed_body:
      'आज रात और कुछ ज़रूरी नहीं। यह नोट आपके अकाउंट पर निजी रहती है।',
    read_partner_a11y: 'पढ़ें आपके साथी ने पिछली रातों में क्या लिखा',
    read_partner_label: 'पढ़ें उन्होंने क्या लिखा →',
    milestone7_kicker: 'रात 7',
    milestone7_title: 'एक हफ़्ता पूरा।',
    milestone7_body: 'आप आते रहे। यही तो पूरी बात थी।',
    milestone14_kicker: 'रात 14',
    milestone14_title: 'आधे से आगे।',
    milestone14_body: 'सफ़र का दो-तिहाई पीछे है। सात रातें बाकी।',
    write_label: 'आपका निजी जवाब',
    write_title: 'सँवारने से पहले लिखें।',
    mood_label: 'आज रात का मूड',
    mood_a11y_prefix: 'मूड ',
    write_placeholder: 'आज रात आपके लिए क्या सच है?',
    note_a11y: 'आज रात की निजी नोट',
    support_a11y: 'सहायता खोजें',
    support_hint: 'क्षेत्र के अनुसार क्राइसिस हेल्पलाइन',
    support_link: 'अगर आज रात भारी है, सहायता खोजें',
    privacy: 'यह नोट सिर्फ़ आप देख सकते हैं।',
    seal_a11y: 'आज रात की नोट सील करें',
    sealing: 'सील हो रही है…',
    seal: 'तारे के रूप में सील करें',
  },
};
