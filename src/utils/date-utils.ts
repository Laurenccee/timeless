export interface DateEntry {
  raw: Date;
  iso: string;
  label: string;
  monthName: string;
}

export function generateDateRange(start: string, end: string): DateEntry[] {
  const dateArray: DateEntry[] = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const iso = current.toISOString().split('T')[0];
    const monthAbbr = current
      .toLocaleDateString('en-US', { month: 'short' })
      .replace('.', '')
      .toUpperCase();

    const day = current.getDate();
    const label = `${monthAbbr}. ${day}`;

    const monthName = current.toLocaleDateString('en-US', { month: 'long' });

    dateArray.push({ raw: new Date(current), label, iso, monthName });
    current.setDate(current.getDate() + 1);
  }

  return dateArray;
}
