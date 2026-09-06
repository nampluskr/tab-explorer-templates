# Bridge 계약 — tab-explorer-templates

Shell은 아래 네 묶음의 동작만 연결 계층에 요청한다 (FR-36).
모든 결과는 `{ "ok": true, "value": ... }` 또는 `{ "ok": false, "error": { "code": "...", "message": "..." } }` 형태를 따른다.

| 묶음 | 동작 | 인자 | 결과 / 설명 |
| --- | --- | --- | --- |
| 대상 | `choose_root` | 없음 | 사용자가 선택한 절대 루트 경로 |
| 대상 | `set_root` | `path` | 지정한 경로를 루트로 설정 |
| 대상 | `list_children` | `relative_path` | 루트 기준 상대 경로의 직속 하위 항목 목록 (루트 경계 검증 포함) |
| 창 | `minimize` | 없음 | 창 최소화 |
| 창 | `toggle_maximize` | 없음 | 최대화 여부 반전 및 반환 (`true` / `false`) |
| 창 | `close` | 없음 | 창 닫기 |
| 창 | `window-state` 알림 | `maximized` (boolean) | 호스트에서 Shell로 보내는 최대화 상태 알림 이벤트 |
| 설정 | `get_settings` | 없음 | Shell 설정 객체 및 runtime 식별 정보 반환 |
| 설정 | `save_settings` | `shell_settings` | Shell 설정 저장 |
| 설정 | `get_recent_folders` | 없음 | 유효한 최근 폴더 목록 반환 (최대 5개) |
| 설정 | `clear_recent_folders` | 없음 | 최근 폴더 목록 비우기 |
| 도메인 | `call_domain` | `target`, `...args` | 이름과 인자를 그대로 도메인 계층에 전달한 결과 |

**규약 제약**:
- Shell은 도메인 이름 목록을 미리 갖지 않고, 인자와 결과를 해석하지 않는다.
- 껍데기는 목록에 없는 호스트 전용 동작을 요구하지 않는다.
