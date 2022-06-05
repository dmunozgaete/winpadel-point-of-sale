export class NumberFormatter {
  toNumber(value: number): string {
    if (!value) {
      return '0';
    }
    const formatted = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.');
    return formatted.substring(0, formatted.length - 3);
  }

  toCurrency(value: number): string {
    if (!value) {
      return '$0';
    }
    const formatted = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.');
    return `$${formatted.substring(0, formatted.length - 3)}`;
  }

  toPhone(phone: string): string {
    if (!phone) {
      return phone;
    }
    let phoneValue = '';
    for (let i = 0, l = phone.length; i < l; i += 1) {
      phoneValue += phone[i];
      phoneValue += i === 0 ? ' ' : '';
      phoneValue += i !== 0 && i % 4 === 0 ? ' ' : '';
    }
    return phoneValue;
  }
}

export default new NumberFormatter();
