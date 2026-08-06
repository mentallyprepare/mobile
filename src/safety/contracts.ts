export type ReportCategory =
  | 'harassment'
  | 'sexual_pressure'
  | 'threat'
  | 'personal_information'
  | 'other';

export const REPORT_CATEGORIES: readonly {
  value: ReportCategory;
  label: string;
}[] = [
  { value: 'harassment', label: 'harassment or pressure' },
  { value: 'sexual_pressure', label: 'sexual pressure' },
  { value: 'threat', label: 'threat or intimidation' },
  { value: 'personal_information', label: 'personal information shared' },
  { value: 'other', label: 'something else' },
];

export function canSubmitReport(
  category: ReportCategory | null,
  reason: string,
): boolean {
  return category !== null && reason.trim().length >= 10 && reason.length <= 500;
}
export function canConfirmAccountDeletion(
  password: string,
  confirmation: string,
): boolean {
  return password.length > 0 && confirmation.trim().toUpperCase() === 'DELETE';
}
