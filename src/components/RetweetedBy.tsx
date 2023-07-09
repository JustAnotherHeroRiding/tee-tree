import React, { useState, useEffect } from "react";
import Link from "next/link";
import { faRetweet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "~/utils/api";

export const RetweetedBy = ({
  id,
  userName,
}: {
  id: string | undefined;
  userName: string | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [returnedUserName, setReturnedUserName] = useState(userName);

  const { data: userData } = api.clerk.getUserById.useQuery({ userId: id } , { enabled: !!id });

  useEffect(() => {
    const loadUserData = () => {
      setLoading(true);
      try {
        if (userData) {
          setReturnedUserName(userData.username);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    void loadUserData();
  }, [id, userData]);

  // If we are loading, or if there is not a userName nor an id, we'll return empty
  if (loading || (!userName && !id)) {
    return null; // or you may want to return loading spinner here or error message if there's an error
  }

  return (
    <Link
      className="-mb-4 flex flex-row hover:underline"
      href={`/@${returnedUserName ? returnedUserName : ""}`}
    >
      <FontAwesomeIcon icon={faRetweet} className="my-auto ml-14 h-4 w-4" />
      <h1 className="ml-2 text-slate-300">Retweeted by {returnedUserName}</h1>
    </Link>
  );
};
