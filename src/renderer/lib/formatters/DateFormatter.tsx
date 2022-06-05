import moment from 'moment';

export class DateFormatter {
  toDateString(date?: Date): string {
    if (!date) {
      return '';
    }

    return moment(date).format('LL');
  }

  toCustomString(momentFormat: string, date?: Date): string {
    if (!date) {
      return '';
    }

    return moment(date).format(momentFormat);
  }
}

export default new DateFormatter();
