/* eslint-disable import/no-dynamic-require */
import moment from 'moment';
import SettingsClient from '../../clients/SettingsClient';

// Use the instance of Settings to get the language
const DEFAULT_LANGUAGE = 'es';

export function setLocale(language: string) {
  const lng = language || DEFAULT_LANGUAGE;

  const momentlng = lng === 'en' ? 'en-gb' : lng; // "EN" DOESNT EXIST :/, WEIRD
  // eslint-disable-next-line global-require
  require(`moment/locale/${momentlng}`); // MOMENT BUG TO SET LOCALE
  moment.locale(momentlng); // Set Moment Locale

  SettingsClient.set('LANGUAGE', lng); // Set locale language
}

export default function i18(locales: any) {
  const language = SettingsClient.get('LANGUAGE', DEFAULT_LANGUAGE);
  const localizations = locales[language];

  return (label: string, replacements: any = {}) => {
    try {
      let labelValue = localizations[label];
      if (!labelValue) {
        throw new Error(
          `The label ${label} is not defined in the locale resource`
        );
      }

      Object.keys(replacements).forEach((key) => {
        labelValue = labelValue.replace(
          new RegExp(`{${key}}`, 'ig'),
          replacements[key]
        );
      });

      return labelValue;
    } catch (ex) {
      console.error(ex);
      return '';
    }
  };
}
