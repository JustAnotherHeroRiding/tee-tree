import { faRetweet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export const RetweetedBy = (props: { username: string }) => {
  return (
    <Link
      className="-mb-4 -mt-4 flex flex-row hover:underline"
      href={`/@${props.username}`}
    >
      <FontAwesomeIcon icon={faRetweet} className="my-auto ml-14 h-4 w-4" />
      <h1 className="ml-2 text-slate-300">Retweeted by {props.username}</h1>
    </Link>
  );
};
