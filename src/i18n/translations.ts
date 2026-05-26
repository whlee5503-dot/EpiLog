export type Lang = 'ko' | 'en';

export interface Translations {
  // ── RecordList ─────────────────────────────────────────────────────────
  rl_title: string;
  rl_subtitle: string;
  rl_stat_records: string;
  rl_stat_cases: string;
  rl_stat_deaths: string;
  rl_metric_new_cases: string;
  rl_metric_ar: string;
  rl_metric_deaths: string;
  rl_empty_title: string;
  rl_empty_desc1: string;
  rl_empty_desc2: string;
  rl_empty_btn: string;
  rl_no_location: string;
  rl_load_error: string;
  // ── NewRecord ──────────────────────────────────────────────────────────
  nr_title: string;
  nr_step1: string;
  nr_step2: string;
  nr_step3: string;
  nr_step4: string;
  nr_survey_datetime: string;
  nr_location: string;
  nr_facility_type: string;
  nr_population: string;
  nr_gps: string;
  nr_patient_name: string;
  nr_optional: string;
  nr_gender: string;
  nr_age: string;
  nr_onset: string;
  nr_symptoms: string;
  nr_contacts_section: string;
  nr_household: string;
  nr_colleague: string;
  nr_community: string;
  nr_cases_section: string;
  nr_new_cases: string;
  nr_deaths: string;
  nr_hospitalized: string;
  nr_transmission: string;
  nr_vaccination: string;
  nr_notes: string;
  nr_save: string;
  nr_analyze: string;
  nr_step_hint: string;
  nr_prev: string;
  nr_next: string;
  nr_gps_collecting: string;
  nr_gps_collect: string;
  nr_gps_recollect: string;
  nr_placeholder_location: string;
  nr_placeholder_name: string;
  nr_placeholder_notes: string;
  // Facility types
  ft_school: string;
  ft_hospital: string;
  ft_workplace: string;
  ft_restaurant: string;
  ft_household: string;
  ft_community: string;
  // Transmission routes
  tr_droplet: string;
  tr_contact: string;
  tr_waterborne: string;
  tr_foodborne: string;
  tr_vector: string;
  // Vaccination
  va_vaccinated: string;
  va_partial: string;
  va_unvaccinated: string;
  va_unknown: string;
  // Gender
  ge_male: string;
  ge_female: string;
  ge_other: string;
  ge_unknown: string;
  // Symptoms
  sy_fever: string;
  sy_cough: string;
  sy_diarrhea: string;
  sy_vomiting: string;
  sy_abdominal: string;
  sy_rash: string;
  sy_dyspnea: string;
  sy_headache: string;
  sy_myalgia: string;
  // ── Dashboard ──────────────────────────────────────────────────────────
  db_title: string;
  db_subtitle: string;
  db_stat_records: string;
  db_stat_cases: string;
  db_stat_deaths: string;
  db_stat_ar: string;
  db_epicurve: string;
  db_cumulative: string;
  db_metrics_title: string;
  db_ar_label: string;
  db_cfr_label: string;
  db_sar_label: string;
  db_transmission: string;
  db_interp_low: string;
  db_interp_mid: string;
  db_interp_high: string;
  db_interp_none: string;
  db_no_data: string;
  db_error: string;
  db_empty_title: string;
  db_empty_desc1: string;
  db_empty_desc2: string;
  db_go_records: string;
  db_bar_name: string;
  db_line_name: string;
  db_individual_section: string;
  db_analyze_epicalc: string;
  // Route labels
  rt_airborne: string;
  rt_droplet: string;
  rt_contact: string;
  rt_foodborne: string;
  rt_waterborne: string;
  rt_vector: string;
  rt_unknown: string;
  // ── App (RecordDetail, NotFound) ───────────────────────────────────────
  app_detail_title: string;
  app_record_id: string;
  app_back_list: string;
  app_not_found: string;
  app_not_found_desc: string;
  app_go_home: string;
  // ── Encryption Setup Modal ────────────────────────────────────────────────
  enc_setup_title: string;
  enc_step_pwd: string;
  enc_step_recovery: string;
  enc_step_done: string;
  enc_pwd_label: string;
  enc_pwd_ph: string;
  enc_pwd_confirm: string;
  enc_pwd_confirm_ph: string;
  enc_show_pwd: string;
  enc_pwd_too_short: string;
  enc_pwd_mismatch: string;
  enc_next: string;
  enc_recovery_desc: string;
  enc_copy: string;
  enc_copied: string;
  enc_written_check: string;
  enc_done_title: string;
  enc_done_desc: string;
  enc_done_btn: string;
  // ── Unlock Modal ──────────────────────────────────────────────────────────
  ul_title: string;
  ul_desc: string;
  ul_pwd_label: string;
  ul_pwd_ph: string;
  ul_unlock_btn: string;
  ul_pwd_error: string;
  ul_switch_recovery: string;
  ul_switch_pwd: string;
  ul_recovery_label: string;
  ul_recovery_ph: string;
  ul_recovery_error: string;
  // ── Privacy Notice Modal ──────────────────────────────────────────────────
  pn_title: string;
  pn_item1: string;
  pn_item2: string;
  pn_item3: string;
  pn_confirm: string;
  // ── Settings ──────────────────────────────────────────────────────────────
  st_title: string;
  st_section_encryption: string;
  st_encryption_desc: string;
  st_status_on: string;
  st_status_off: string;
  st_enable_btn: string;
  st_disable_btn: string;
  st_change_pwd_btn: string;
  st_disable_desc: string;
  st_disable_error: string;
  st_chpwd_title: string;
  st_old_pwd_label: string;
  st_new_pwd_label: string;
  st_new_pwd_confirm: string;
  st_chpwd_error: string;
  st_new_recovery_title: string;
  st_new_recovery_desc: string;
  st_cancel: string;
  st_confirm: string;
  st_privacy_desc: string;
  st_privacy_view: string;
}

export const T: Record<Lang, Translations> = {
  ko: {
    rl_title: '조사 기록 목록',
    rl_subtitle: '현장 역학조사 전체 기록',
    rl_stat_records: '총 기록',
    rl_stat_cases: '누적 환자',
    rl_stat_deaths: '누적 사망',
    rl_metric_new_cases: '신규 확진',
    rl_metric_ar: '발병률(AR)',
    rl_metric_deaths: '사망',
    rl_empty_title: '기록이 없습니다',
    rl_empty_desc1: '현장 역학조사 결과를 기록하면',
    rl_empty_desc2: '이곳에 목록으로 표시됩니다.',
    rl_empty_btn: '첫 기록 추가하기',
    rl_no_location: '(장소 미입력)',
    rl_load_error: '데이터를 불러오지 못했습니다.',

    nr_title: '새 현장 기록',
    nr_step1: '기본정보',
    nr_step2: '지표환자',
    nr_step3: '접촉자',
    nr_step4: '역학특성',
    nr_survey_datetime: '조사 일시',
    nr_location: '발생 장소',
    nr_facility_type: '시설 유형',
    nr_population: '위험 노출 인구 (명)',
    nr_gps: 'GPS 좌표',
    nr_patient_name: '환자명',
    nr_optional: '(선택)',
    nr_gender: '성별',
    nr_age: '나이 (만)',
    nr_onset: '증상 발생일',
    nr_symptoms: '주요 증상',
    nr_contacts_section: '접촉자 분류',
    nr_household: '동거 가족',
    nr_colleague: '직장/학교',
    nr_community: '지역사회',
    nr_cases_section: '당일 발생 현황',
    nr_new_cases: '신규 확진',
    nr_deaths: '사망',
    nr_hospitalized: '신규 입원',
    nr_transmission: '추정 전파 경로',
    nr_vaccination: '예방접종 여부',
    nr_notes: '메모 및 특이사항',
    nr_save: '저장하기',
    nr_analyze: 'EpiCalc 분석',
    nr_step_hint: '위의 버튼으로 저장 또는 분석을 진행하세요',
    nr_prev: '이전',
    nr_next: '다음',
    nr_gps_collecting: '위치 수집 중…',
    nr_gps_collect: 'GPS 수집',
    nr_gps_recollect: '재수집',
    nr_placeholder_location: '예: ○○초등학교, △△요양원',
    nr_placeholder_name: '이름 또는 익명 코드 (예: P-001)',
    nr_placeholder_notes: '조사관 메모, 특이사항을 자유롭게 입력하세요',

    ft_school: '학교',
    ft_hospital: '병원/의료기관',
    ft_workplace: '직장',
    ft_restaurant: '식당/음식점',
    ft_household: '가정',
    ft_community: '지역사회',

    tr_droplet: '비말 전파',
    tr_contact: '접촉 전파',
    tr_waterborne: '수인성',
    tr_foodborne: '식품 매개',
    tr_vector: '매개체(벡터)',

    va_vaccinated: '완전 접종',
    va_partial: '부분 접종',
    va_unvaccinated: '미접종',
    va_unknown: '확인 불가',

    ge_male: '남',
    ge_female: '여',
    ge_other: '기타',
    ge_unknown: '미상',

    sy_fever: '발열',
    sy_cough: '기침',
    sy_diarrhea: '설사',
    sy_vomiting: '구토',
    sy_abdominal: '복통',
    sy_rash: '발진',
    sy_dyspnea: '호흡곤란',
    sy_headache: '두통',
    sy_myalgia: '근육통',

    db_title: '발생 현황 대시보드',
    db_subtitle: '역학 지표 요약',
    db_stat_records: '총 기록 수',
    db_stat_cases: '누적 환자 수',
    db_stat_deaths: '누적 사망 수',
    db_stat_ar: '전체 AR (%)',
    db_epicurve: '일별 발생 현황',
    db_cumulative: '누적 환자 추이',
    db_metrics_title: '역학 지표 요약',
    db_ar_label: '발병률',
    db_cfr_label: '치명률',
    db_sar_label: '2차 발병률 (가족 기준)',
    db_transmission: '전파 경로 분포',
    db_interp_low: '낮음',
    db_interp_mid: '보통 수준',
    db_interp_high: '높음',
    db_interp_none: '데이터 없음',
    db_no_data: '표시할 데이터가 없습니다',
    db_error: '데이터를 불러오지 못했습니다.',
    db_empty_title: '아직 기록이 없습니다',
    db_empty_desc1: '현장 역학조사 기록을 추가하면',
    db_empty_desc2: '여기에 통계가 표시됩니다.',
    db_go_records: '기록 목록으로 이동',
    db_bar_name: '신규 환자',
    db_line_name: '누적 환자',
    db_individual_section: '개별 기록 분석',
    db_analyze_epicalc: 'EpiCalc로 분석',

    rt_airborne: '공기 전파',
    rt_droplet: '비말 전파',
    rt_contact: '접촉 전파',
    rt_foodborne: '식품 매개',
    rt_waterborne: '수인성',
    rt_vector: '매개체',
    rt_unknown: '미상',

    app_detail_title: '기록 상세 준비 중',
    app_record_id: '기록 ID:',
    app_back_list: '목록으로 돌아가기',
    app_not_found: '페이지를 찾을 수 없습니다',
    app_not_found_desc: '요청하신 주소가 올바른지 확인해 주세요.',
    app_go_home: '홈으로 이동',

    enc_setup_title: '암호화 설정',
    enc_step_pwd: '비밀번호 설정',
    enc_step_recovery: '복구 코드 보관',
    enc_step_done: '완료',
    enc_pwd_label: '비밀번호',
    enc_pwd_ph: '최소 8자 이상',
    enc_pwd_confirm: '비밀번호 확인',
    enc_pwd_confirm_ph: '비밀번호를 다시 입력하세요',
    enc_show_pwd: '비밀번호 표시',
    enc_pwd_too_short: '비밀번호는 최소 8자 이상이어야 합니다.',
    enc_pwd_mismatch: '비밀번호가 일치하지 않습니다.',
    enc_next: '다음',
    enc_recovery_desc: '비밀번호를 잊었을 때 이 코드로 잠금 해제할 수 있습니다. 반드시 안전한 곳에 보관하세요.',
    enc_copy: '복사',
    enc_copied: '복사됨',
    enc_written_check: '복구 코드를 종이에 적거나 안전한 곳에 저장했습니다.',
    enc_done_title: '암호화가 활성화되었습니다',
    enc_done_desc: '현장 조사 데이터가 AES-256으로 보호됩니다.',
    enc_done_btn: '확인',

    ul_title: '잠금 해제',
    ul_desc: '데이터가 암호화되어 있습니다. 비밀번호를 입력하세요.',
    ul_pwd_label: '비밀번호',
    ul_pwd_ph: '비밀번호 입력',
    ul_unlock_btn: '잠금 해제',
    ul_pwd_error: '비밀번호가 올바르지 않습니다.',
    ul_switch_recovery: '복구 코드로 잠금 해제',
    ul_switch_pwd: '비밀번호로 잠금 해제',
    ul_recovery_label: '복구 코드 (16자리)',
    ul_recovery_ph: '복구 코드를 입력하세요',
    ul_recovery_error: '복구 코드가 올바르지 않습니다.',

    st_title: '설정',
    st_section_encryption: '데이터 암호화',
    st_encryption_desc: '현장 조사 데이터를 AES-256-GCM으로 암호화하여 보호합니다.',
    st_status_on: '활성화됨',
    st_status_off: '비활성화됨',
    st_enable_btn: '암호화 활성화',
    st_disable_btn: '암호화 비활성화',
    st_change_pwd_btn: '비밀번호 변경',
    st_disable_desc: '암호화를 비활성화하려면 현재 비밀번호를 입력하세요.',
    st_disable_error: '비밀번호가 올바르지 않습니다.',
    st_chpwd_title: '비밀번호 변경',
    st_old_pwd_label: '현재 비밀번호',
    st_new_pwd_label: '새 비밀번호',
    st_new_pwd_confirm: '새 비밀번호 확인',
    st_chpwd_error: '비밀번호 변경에 실패했습니다.',
    st_new_recovery_title: '새 복구 코드',
    st_new_recovery_desc: '비밀번호 변경으로 새 복구 코드가 생성되었습니다. 기존 코드는 더 이상 사용할 수 없습니다.',
    st_cancel: '취소',
    st_confirm: '확인',
    st_privacy_desc: '데이터 보호 방식을 확인합니다.',
    st_privacy_view: '보기',

    pn_title: '개인정보 안내',
    pn_item1: '모든 데이터는 이 기기에만 저장됩니다 — 서버로 전송되지 않습니다.',
    pn_item2: '환자 이름 입력은 선택사항입니다 — 익명 코드(예: P-001) 사용을 권장합니다.',
    pn_item3: 'AES-256 암호화를 사용할 수 있습니다 — 설정에서 활성화하세요.',
    pn_confirm: '확인했습니다',
  },

  en: {
    rl_title: 'Field Records',
    rl_subtitle: 'All Field Investigation Records',
    rl_stat_records: 'Records',
    rl_stat_cases: 'Total Cases',
    rl_stat_deaths: 'Deaths',
    rl_metric_new_cases: 'New Cases',
    rl_metric_ar: 'Attack Rate',
    rl_metric_deaths: 'Deaths',
    rl_empty_title: 'No Records',
    rl_empty_desc1: 'Field investigation results',
    rl_empty_desc2: 'will appear here.',
    rl_empty_btn: 'Add First Record',
    rl_no_location: '(No location)',
    rl_load_error: 'Failed to load data.',

    nr_title: 'New Field Record',
    nr_step1: 'Basic Info',
    nr_step2: 'Index Case',
    nr_step3: 'Contacts',
    nr_step4: 'Epi Characteristics',
    nr_survey_datetime: 'Survey Date/Time',
    nr_location: 'Location',
    nr_facility_type: 'Facility Type',
    nr_population: 'At-risk Population',
    nr_gps: 'Coordinates',
    nr_patient_name: 'Patient Name',
    nr_optional: '(Optional)',
    nr_gender: 'Gender',
    nr_age: 'Age (yrs)',
    nr_onset: 'Onset Date',
    nr_symptoms: 'Key Symptoms',
    nr_contacts_section: 'Contact Classification',
    nr_household: 'Household',
    nr_colleague: 'Colleague',
    nr_community: 'Community',
    nr_cases_section: 'Daily Cases',
    nr_new_cases: 'New Cases',
    nr_deaths: 'Deaths',
    nr_hospitalized: 'Hospitalized',
    nr_transmission: 'Transmission Route',
    nr_vaccination: 'Vaccination Status',
    nr_notes: 'Notes',
    nr_save: 'Save',
    nr_analyze: 'Analyze',
    nr_step_hint: 'Use buttons above to save or analyze',
    nr_prev: 'Prev',
    nr_next: 'Next',
    nr_gps_collecting: 'Collecting location…',
    nr_gps_collect: 'Collect GPS',
    nr_gps_recollect: 'Recollect',
    nr_placeholder_location: 'e.g. Springfield Elementary School',
    nr_placeholder_name: 'Name or anonymous code (e.g. P-001)',
    nr_placeholder_notes: 'Enter investigator notes or special findings',

    ft_school: 'School',
    ft_hospital: 'Hospital/Medical',
    ft_workplace: 'Workplace',
    ft_restaurant: 'Restaurant',
    ft_household: 'Household',
    ft_community: 'Community',

    tr_droplet: 'Droplet',
    tr_contact: 'Contact',
    tr_waterborne: 'Waterborne',
    tr_foodborne: 'Foodborne',
    tr_vector: 'Vector-borne',

    va_vaccinated: 'Fully Vaccinated',
    va_partial: 'Partially Vaccinated',
    va_unvaccinated: 'Unvaccinated',
    va_unknown: 'Unknown',

    ge_male: 'M',
    ge_female: 'F',
    ge_other: 'Other',
    ge_unknown: 'Unk.',

    sy_fever: 'Fever',
    sy_cough: 'Cough',
    sy_diarrhea: 'Diarrhea',
    sy_vomiting: 'Vomiting',
    sy_abdominal: 'Abd. Pain',
    sy_rash: 'Rash',
    sy_dyspnea: 'Dyspnea',
    sy_headache: 'Headache',
    sy_myalgia: 'Myalgia',

    db_title: 'Outbreak Dashboard',
    db_subtitle: 'Epi Metrics Summary',
    db_stat_records: 'Records',
    db_stat_cases: 'Total Cases',
    db_stat_deaths: 'Deaths',
    db_stat_ar: 'Overall AR (%)',
    db_epicurve: 'Epidemic Curve',
    db_cumulative: 'Cumulative Cases',
    db_metrics_title: 'Epi Metrics Summary',
    db_ar_label: 'Attack Rate',
    db_cfr_label: 'Case Fatality Rate',
    db_sar_label: 'Secondary Attack Rate',
    db_transmission: 'Transmission Routes',
    db_interp_low: 'Low',
    db_interp_mid: 'Moderate',
    db_interp_high: 'High',
    db_interp_none: 'No data',
    db_no_data: 'No data to display',
    db_error: 'Failed to load data.',
    db_empty_title: 'No records yet',
    db_empty_desc1: 'Statistics will appear here',
    db_empty_desc2: 'after adding records.',
    db_go_records: 'Go to Records',
    db_bar_name: 'New Cases',
    db_line_name: 'Cumulative',
    db_individual_section: 'Individual Record Analysis',
    db_analyze_epicalc: 'Analyze with EpiCalc',

    rt_airborne: 'Airborne',
    rt_droplet: 'Droplet',
    rt_contact: 'Contact',
    rt_foodborne: 'Foodborne',
    rt_waterborne: 'Waterborne',
    rt_vector: 'Vector-borne',
    rt_unknown: 'Unknown',

    app_detail_title: 'Record Detail Coming Soon',
    app_record_id: 'Record ID:',
    app_back_list: 'Back to List',
    app_not_found: 'Page Not Found',
    app_not_found_desc: 'Please check if the URL is correct.',
    app_go_home: 'Go Home',

    enc_setup_title: 'Encryption Setup',
    enc_step_pwd: 'Set Password',
    enc_step_recovery: 'Save Recovery Code',
    enc_step_done: 'Done',
    enc_pwd_label: 'Password',
    enc_pwd_ph: 'At least 8 characters',
    enc_pwd_confirm: 'Confirm Password',
    enc_pwd_confirm_ph: 'Re-enter your password',
    enc_show_pwd: 'Show password',
    enc_pwd_too_short: 'Password must be at least 8 characters.',
    enc_pwd_mismatch: 'Passwords do not match.',
    enc_next: 'Next',
    enc_recovery_desc: 'Use this code to unlock the app if you forget your password. Store it somewhere safe.',
    enc_copy: 'Copy',
    enc_copied: 'Copied',
    enc_written_check: 'I have written down or securely stored my recovery code.',
    enc_done_title: 'Encryption Enabled',
    enc_done_desc: 'Your field data is now protected with AES-256.',
    enc_done_btn: 'Done',

    ul_title: 'Unlock',
    ul_desc: 'Your data is encrypted. Enter your password to continue.',
    ul_pwd_label: 'Password',
    ul_pwd_ph: 'Enter password',
    ul_unlock_btn: 'Unlock',
    ul_pwd_error: 'Incorrect password.',
    ul_switch_recovery: 'Unlock with recovery code',
    ul_switch_pwd: 'Unlock with password',
    ul_recovery_label: 'Recovery Code (16 characters)',
    ul_recovery_ph: 'Enter recovery code',
    ul_recovery_error: 'Invalid recovery code.',

    st_title: 'Settings',
    st_section_encryption: 'Data Encryption',
    st_encryption_desc: 'Protect your field investigation data with AES-256-GCM encryption.',
    st_status_on: 'Enabled',
    st_status_off: 'Disabled',
    st_enable_btn: 'Enable Encryption',
    st_disable_btn: 'Disable Encryption',
    st_change_pwd_btn: 'Change Password',
    st_disable_desc: 'Enter your current password to disable encryption.',
    st_disable_error: 'Incorrect password.',
    st_chpwd_title: 'Change Password',
    st_old_pwd_label: 'Current Password',
    st_new_pwd_label: 'New Password',
    st_new_pwd_confirm: 'Confirm New Password',
    st_chpwd_error: 'Failed to change password.',
    st_new_recovery_title: 'New Recovery Code',
    st_new_recovery_desc: 'A new recovery code was generated. Your old code is no longer valid.',
    st_cancel: 'Cancel',
    st_confirm: 'Confirm',
    st_privacy_desc: 'Review how your data is protected.',
    st_privacy_view: 'View',

    pn_title: 'Privacy Notice',
    pn_item1: 'All data is stored only on this device — nothing is sent to any server.',
    pn_item2: 'Patient name is optional — using an anonymous code (e.g. P-001) is recommended.',
    pn_item3: 'AES-256 encryption is available — enable it in Settings.',
    pn_confirm: 'I Understand',
  },
};
