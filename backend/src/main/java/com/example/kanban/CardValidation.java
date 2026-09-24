package com.example.kanban;

/** カードの入力値の検証ルール(DTOの`@Pattern`で共通利用する)。 */
final class CardValidation {

  /** 優先度は high / medium / low のいずれか。空文字は「指定なし」として許容する(従来の挙動)。 */
  static final String PRIORITY_REGEX = "^(high|medium|low)?$";

  static final String PRIORITY_MESSAGE = "priority must be one of: high, medium, low";

  /** 期日は YYYY-MM-DD 形式(フロントの日付入力が送る形式)。未指定(null)は許容する。 */
  static final String DUE_DATE_REGEX = "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$";

  static final String DUE_DATE_MESSAGE = "dueDate must be in YYYY-MM-DD format";

  private CardValidation() {}
}
