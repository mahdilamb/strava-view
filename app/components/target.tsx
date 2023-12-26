import { SummaryActivityDecoded } from "../service";
import { SummaryActivity } from "../strava";

export type ActivityTarget = {
  name: string
  predicate: (activity: SummaryActivity | SummaryActivityDecoded) => boolean
  color: string
}
export function Target() {
  return (
    <li role="presentation">
      <a
        href="#pills-home"
        className="my-2 block rounded bg-neutral-100 px-7 pb-3.5 pt-4 text-xs font-medium uppercase leading-tight text-neutral-500 data-[te-nav-active]:!bg-primary-100 data-[te-nav-active]:text-primary-700 dark:bg-neutral-700 dark:text-white dark:data-[te-nav-active]:text-primary-700 md:mr-4"
        id="pills-home-tab"
        data-te-toggle="pill"
        data-te-target="#pills-home"
        data-te-nav-active
        role="tab"
        aria-controls="pills-home"
        aria-selected="true"
      >
        Home
      </a>
    </li>
  );
}
