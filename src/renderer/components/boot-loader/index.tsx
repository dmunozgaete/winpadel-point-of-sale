import React from 'react';
import SettingsClient from '../../clients/SettingsClient';
import JobList from '../../jobs';
import Job from '../../lib/Job';
import { setLocale } from '../../lib/i18n';

interface IProps {
  onLoadComplete: (status: {}) => void;
}
interface IState {}

export default class BootLoader extends React.Component<IProps, IState> {
  componentDidMount() {
    this.callAllBoots();
  }

  /**
   * Because i need to use capacitors plugins like Storage Plugin,
   * The "constructor" are Promises!!, so i need to call, in order
   * to ensure, that the plugin will be loaded before "start the app"
   *
   * @memberof BootLoader
   */
  async callAllBoots() {
    // TODO: Fix the really deletion of the records from the PouchDB
    // Insights:
    // - https://stackoverflow.com/questions/39471351/how-do-i-force-pouchdb-to-really-delete-records
    // - https://github.com/pouchdb/pouchdb/issues/802
    // Solution:
    // Get all docs (witouth the deleted ones)
    // And copy into another database ^^, then destroy the old one, and
    // replace with the new one without the "deleted documents"
    // - https://github.com/pouchdb/pouchdb/issues/7598

    // Set the language
    const language = SettingsClient.get('LANGUAGE', 'es');
    console.log('language', language);
    setLocale(language);

    // Job's Boot
    const promisesToWait: Promise<void>[] = [];
    Object.keys(JobList).forEach((key: string) => {
      const job: Job = (JobList as Record<string, Job>)[key];
      promisesToWait.push(job.boot());
    });

    const { onLoadComplete } = this.props;
    Promise.all(promisesToWait)
      .then(() => onLoadComplete({}))
      .catch((ex) => console.error(ex));
  }

  render() {
    return <div className="boot-loader">Loading</div>;
  }
}
