// §32 — Tamil → English translation lab items. Tamil script + transliteration,
// tagged with the canonical grammar rule ids they exercise.
export type TamilItem = {
  slug: string; tamil: string; transliteration: string; context: 'daily' | 'business' | 'formal';
  targetRules: string[];
};

const T = (slug: string, tamil: string, transliteration: string, context: TamilItem['context'], targetRules: string[]): TamilItem =>
  ({ slug, tamil, transliteration, context, targetRules });

export const TAMIL_ITEMS: TamilItem[] = [
  // daily
  T('t01', 'நேற்று காலை நான் அலுவலகம் சென்றேன்.', 'Nethu kaalai naan aluvalagam sendren.', 'daily', ['did-plus-past-form', 'today-morning']),
  T('t02', 'நான் சாப்பிடவில்லை.', 'Naan saappidavillai.', 'daily', []),
  T('t03', 'அவன் நேற்று வீட்டிற்கு வந்தான்.', 'Avan nethu veettukku vandhaan.', 'daily', ['tense-consistency']),
  T('t04', 'நான் ஒரு சந்தேகம் இருக்கிறேன்.', 'Naan oru sandhegam irukkiren.', 'daily', ['have-a-doubt']),
  T('t05', 'நாளைக்கு நான் ஊருக்கு போறேன்.', 'Naalaikku naan oorukku poren.', 'daily', []),
  T('t06', 'அவர் இன்னும் வரலை.', 'Avar innum varalai.', 'daily', ['tense-consistency']),
  T('t07', 'நான் ரொம்ப வேலை இருக்கு.', 'Naan romba velai irukku.', 'daily', ['subject-verb-agreement']),
  T('t08', 'அந்த பையன் நல்ல படிக்குறான்.', 'Andha paiyan nalla padikkuraan.', 'daily', []),
  T('t09', 'நீ எப்போ வருவே?', 'Nee eppo varuve?', 'daily', ['question-word-order']),
  T('t10', 'நான் அங்கே போக முடியாது.', 'Naan ange poga mudiyaadhu.', 'daily', ['modal-plus-base']),
  T('t11', 'அவன் என்ன சொன்னான்?', 'Avan enna sonnaan?', 'daily', ['question-word-order']),
  T('t12', 'இது என் புக்.', 'Idhu en book.', 'daily', ['article-missing']),
  T('t13', 'நான் அதை நேற்றே பார்த்தேன்.', 'Naan adhai nethe paarthen.', 'daily', ['sentence-final-only-itself']),
  T('t14', 'வாங்க நாம காபி குடிக்கலாம்.', 'Vaanga naama coffee kudikkalaam.', 'daily', []),
  T('t15', 'அவள் வீட்டில் இருக்காளா?', 'Aval veettil irukkala?', 'daily', ['question-word-order']),

  // business
  T('t16', 'நாளை மீட்டிங் உள்ளது.', 'Naalai meeting ulladhu.', 'business', ['article-missing']),
  T('t17', 'நான் உங்களுக்கு ஒரு மெயில் அனுப்புவேன்.', 'Naan ungalukku oru mail anuppuven.', 'business', []),
  T('t18', 'இந்த ரிப்போர்ட் ரெடி இல்லை.', 'Indha report ready illai.', 'business', ['article-missing']),
  T('t19', 'நான் அதை இன்றே முடிப்பேன்.', 'Naan adhai inre mudippen.', 'business', ['sentence-final-only-itself']),
  T('t20', 'உங்களுக்கு என்ன வேண்டும்?', 'Ungalukku enna vendum?', 'business', ['question-word-order']),
  T('t21', 'பட்ஜெட் கொஞ்சம் குறையா இருக்கு.', 'Budget konjam kuraiya irukku.', 'business', ['article-missing']),
  T('t22', 'மீட்டிங் கேன்சல் ஆயிடுச்சு.', 'Meeting cancel aayiduchu.', 'business', ['passive-form']),
  T('t23', 'அவர் நிறைய வேலை பாக்குறார்.', 'Avar niraiya velai paakkuraar.', 'business', []),
  T('t24', 'நம்ம டீம் நல்லா செய்யுது.', 'Namma team nalla seyyudhu.', 'business', []),
  T('t25', 'நான் கிளையன்ட் கிட்ட சொல்லிட்டேன்.', 'Naan client kitta sollitten.', 'business', ['tense-consistency']),

  // formal
  T('t26', 'நான் மன்னிப்பு கேட்கிறேன்.', 'Naan mannippu ketkiren.', 'formal', []),
  T('t27', 'உங்கள் கடிதம் கிடைத்தது.', 'Ungal kaditham kidaithathu.', 'formal', []),
  T('t28', 'நான் விரைவில் பதில் அளிப்பேன்.', 'Naan viraivil badhil alippen.', 'formal', []),
  T('t29', 'தயவுசெய்து இதை உறுதிப்படுத்தவும்.', 'Thayavuseidhu idhai urudhippaduthavum.', 'formal', ['do-the-needful']),
  T('t30', 'மேலும் விவரங்களுக்கு அழைக்கவும்.', 'Melum vivarangalukku azhaiyavum.', 'formal', []),

  // extra daily
  T('t31', 'அவன் சாப்பிட்டுட்டு படுத்தான்.', 'Avan saappittu paduthaan.', 'daily', []),
  T('t32', 'நான் இந்த விஷயம் பத்தி யோசிக்கிறேன்.', 'Naan indha vishayam patthi yosikiren.', 'daily', []),
  T('t33', 'அவர் என்னை மீட் பண்ண வந்தார்.', 'Avar ennai meet panna vandhaar.', 'daily', []),
  T('t34', 'நான் அந்த புக் படிச்சு முடிச்சேன்.', 'Naan andha book padichu mudichen.', 'daily', ['tense-consistency']),
  T('t35', 'அது நல்லா இல்லை.', 'Adhu nalla illai.', 'daily', []),
  T('t36', 'நான் கொஞ்சம் தயார்ட்.', 'Naan konjam tired.', 'daily', []),
  T('t37', 'அவள் ரொம்ப ஸ்மார்ட்.', 'Aval romba smart.', 'daily', []),
  T('t38', 'நான் நாளைக்கு வருவேன்.', 'Naan naalaikku varuven.', 'daily', []),
  T('t39', 'இது மிகவும் முக்கியம்.', 'Idhu migavum mukkiyam.', 'daily', []),
  T('t40', 'அவர் என்னை பார்க்க வருவாரா?', 'Avar ennai paarka varuvaara?', 'daily', ['question-word-order']),
  T('t41', 'அந்த சினிமா பார்த்தியா?', 'Andha cinema paarthiya?', 'daily', ['article-missing', 'question-word-order']),
  T('t42', 'நான் என்ன செய்யணும்?', 'Naan enna seiyyanum?', 'daily', ['question-word-order']),
  T('t43', 'அவருக்கு இது தெரியும்.', 'Avarukku idhu theriyum.', 'daily', []),
  T('t44', 'இங்கே வந்து உட்காரு.', 'Inge vandhu ukkaru.', 'daily', []),
  T('t45', 'அது சரி இல்லை.', 'Adhu sari illai.', 'daily', []),
  T('t46', 'நான் அதை நேற்று தான் கேள்விப்பட்டேன்.', 'Naan adhai nethu dhaan kelvippatten.', 'daily', ['sentence-final-only-itself']),
  T('t47', 'அவள் நல்ல பாடுவாள்.', 'Aval nalla paaduva.', 'daily', []),
  T('t48', 'நான் ஒரு வேளை வருவேன்.', 'Naan oru velai varuven.', 'daily', []),
  T('t49', 'அந்த வேலை நாளைக்கு முடியும்.', 'Andha velai naalaikku mudiyum.', 'daily', []),
  T('t50', 'அவன் கிட்ட ஒரு புது பைக் இருக்கு.', 'Avan kitta oru pudhu bike irukku.', 'daily', []),
  T('t51', 'நான் உன்னை நாளை அழைக்கிறேன்.', 'Naan unnai naalai azhikiren.', 'daily', []),
  T('t52', 'அது கொஞ்சம் வேற மாதிரி.', 'Adhu konjam vera maadhiri.', 'daily', []),
  T('t53', 'நான் இன்று நல்லா படிச்சேன்.', 'Naan indru nalla padichen.', 'daily', []),
  T('t54', 'அவர் ஒரு நல்ல டாக்டர்.', 'Avar oru nalla doctor.', 'daily', ['article-missing']),
  T('t55', 'நான் இந்த வாரம் வேலை நிறைய இருக்கு.', 'Naan indha vaaram velai niraiya irukku.', 'daily', []),
  T('t56', 'அவள் வந்துட்டாள்.', 'Aval vandhuttaal.', 'daily', []),
  T('t57', 'நான் அதை பார்த்தாச்சு.', 'Naan adhai paarthachchu.', 'daily', ['tense-consistency']),
  T('t58', 'உனக்கு இது பிடிக்கும்.', 'Unakku idhu pidikkum.', 'daily', []),
  T('t59', 'நாளைக்கு காலை ஒன்பது மணிக்கு வாங்க.', 'Naalaikku kaalai onbadhu manikku vaanga.', 'daily', []),
  T('t60', 'அவன் நன்றாக இருக்கான்.', 'Avan nandraga irukkaan.', 'daily', []),
];
