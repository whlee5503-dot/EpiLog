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
    db_epicurve: '일별 발생 현황 (Epidemic Curve)',
    db_cumulative: '누적 환자 추이',
    db_metrics_title: '역학 지표 요약',
    db_ar_label: '발병률 (Attack Rate)',
    db_cfr_label: '치명률 (Case Fatality Rate)',
    db_sar_label: '2차 발병률 (SAR, 가족 기준)',
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
  },
};
