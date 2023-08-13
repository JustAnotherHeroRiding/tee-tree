import Image from "next/image";
import { api, type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import {
  faComment,
  faHeart,
  faShare,
  faRetweet,
  faXmark,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect, useRef, useContext, type FC } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { LoadingSpinner } from "./loading";
import { Tooltip } from "react-tooltip";
import TextareaAutosize from "react-textarea-autosize";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AdvancedImage, lazyload } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
// Import required actions and qualifiers.
import React from "react";
import { useHomePage } from "~/components/Context/HomePageContext";
import { UserContext } from "~/components/Context/UserContext";
import {
  EmailIcon,
  EmailShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  ViberIcon,
  ViberShareButton,
  VKIcon,
  VKShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { useRouter } from "next/router";
import { UserHoverCard } from "./UserHover";
import { CreatePostWizard, type User } from "./CreatePostWizard";
import { UserCard } from "./UserMentionSuggestions";

dayjs.extend(relativeTime);

export type PostWithUser = RouterOutputs["posts"]["getAll"][number];

type PostContentProps = {
  content: string;
};

export const PostContent: FC<PostContentProps> = ({ content }) => {
  const { userList, isLoading } = useContext(UserContext);

  const [
    fetchMentionedUsersFollowingData,
    setFetchMentionedUsersFollowingData,
  ] = useState(false);

  const { data: followingData } = api.follow.getFollowingCurrentUser.useQuery();
  const mentionedUserIdsArray = useRef<string[]>([]);
  const newMentionedUserIdsArray: string[] = [];

  //const router = useRouter();
  const { user } = useUser();

  const { data: followersDataMentionedUsers } =
    api.follow.getFollowersCountByIds.useQuery(
      { mentionedUserIds: mentionedUserIdsArray.current },
      { enabled: fetchMentionedUsersFollowingData }
    );
  const { data: followingDataMentionedUsers } =
    api.follow.getFollowingCountByIds.useQuery(
      { mentionedUserIds: mentionedUserIdsArray.current },
      {
        enabled: fetchMentionedUsersFollowingData,
      }
    );

  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [followerCount, setFollowerCount] = useState<{ [key: string]: number }>(
    {}
  );
  const [followingCount, setFollowingCount] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (mentionedUserIdsArray.current.length > 0) {
      setFetchMentionedUsersFollowingData(true);
    }
  }, [mentionedUserIdsArray]);

  useEffect(() => {
    if (followingData) {
      const followingMap = followingData.reduce<{ [key: string]: boolean }>(
        (acc, user) => {
          acc[user.followed.followingId] = true;
          return acc;
        },
        {}
      );
      setIsFollowing(followingMap);
    }
  }, [followingData]);

  useEffect(() => {
    if (followersDataMentionedUsers && followingDataMentionedUsers) {
      setFollowerCount(followersDataMentionedUsers);
      setFollowingCount(followingDataMentionedUsers);
    }
  }, [followersDataMentionedUsers, followingDataMentionedUsers]);

  const { mutate, isLoading: isFollowingLoading } =
    api.profile.followUser.useMutation({
      onSuccess: (data, variables) => {
        console.log(`You are now following the user.`);

        // Create a copy of the 'isFollowing' and 'followerCount' states
        const newIsFollowing = { ...isFollowing };
        const newFollowerCount = { ...followerCount };

        // Check if the current user is already following the user
        if (isFollowing[variables.userToFollowId]) {
          // If so, set 'isFollowing[userId]' to false to indicate that the current user has unfollowed the user
          newIsFollowing[variables.userToFollowId] = false;
          setIsFollowing(newIsFollowing);

          // Decrement the follower count for this user
          if (newFollowerCount[variables.userToFollowId]) {
            newFollowerCount[variables.userToFollowId] -= 1;
          } else {
            newFollowerCount[variables.userToFollowId] = 0; // assuming when not found, the followerCount should be 0
          }
        } else {
          // Otherwise, set 'isFollowing[userId]' to true to indicate that the current user is now following the user
          newIsFollowing[variables.userToFollowId] = true;
          setIsFollowing(newIsFollowing);

          // Increment the follower count for this user
          newFollowerCount[variables.userToFollowId] =
            (newFollowerCount[variables.userToFollowId] || 0) + 1;
        }

        // Update the 'followerCount' state
        setFollowerCount(newFollowerCount);
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Follow! Are you logged in?");
        }
      },
    });

  if (!userList) {
    console.log("No users");
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const words = content.split(" ");
  const coloredWords = words.map((word, index) => {
    if (word.startsWith("#")) {
      return (
        <Link
          key={index}
          href={`/i/search?q=${word.slice(
            1
          )}&src=post_trend_click&selector=top`}
          className="text-Intone-300 hover:underline"
        >
          {word}
        </Link>
      );
    } else if (word.startsWith("@") && userList) {
      const mentionedUser = userList.find(
        (user) => user.username === word.slice(1)
      );
      if (mentionedUser) {
        const username = word.slice(1);

        const mentionedUserId = mentionedUser.id;
        newMentionedUserIdsArray.push(mentionedUserId);

        return (
          <span key={index} className=" w-fit">
            <div className="group inline-block">
              <span
                className="flex flex-row text-Intone-300 "
                onClick={(event) => {
                  event.preventDefault();
                }}
              >
                @
                <Link href={`/@${username}`} className="peer hover:underline">
                  {username}
                </Link>
                <UserHoverCard
                  user={user as User}
                  userList={userList}
                  mentionedUser={mentionedUser}
                  username={username}
                  isFollowingLoading={isFollowingLoading}
                  isFollowing={isFollowing}
                  followingData={followingData}
                  mutate={mutate}
                  followingCount={followingCount}
                  followerCount={followerCount}
                  location="post"
                />
              </span>
            </div>
          </span>
        );
      } else {
        return <span key={index}>{word}</span>;
      }
    } else {
      return <span key={index}>{word}</span>;
    }
  });
  if (newMentionedUserIdsArray.length >= 1) {
    mentionedUserIdsArray.current = newMentionedUserIdsArray;
  }

  return (
    <span className="text-2xl sm:whitespace-pre-wrap">
      {coloredWords.reduce<React.ReactNode[]>(
        (prev, curr, index) => (index === 0 ? [curr] : [...prev, " ", curr]),
        []
      )}
    </span>
  );
};

const PostViewComponent = (props: PostWithUser) => {
  //const deleteImageUrl = `https://api.cloudinary.com/v1_1/de5zmknvp/image/destroy`;

  const { post, author } = props;
  const cld = new Cloudinary({ cloud: { cloudName: "de5zmknvp" } });
  const { homePage } = useHomePage();

  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);

  const { user } = useUser();
  const { userList } = useContext(UserContext);

  const { data: trends, isLoading: loadingTrends } =
    api.posts.getTrends.useQuery({});

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [input, setInput] = useState(post.content);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const modalDeletePostRef = useRef<HTMLDivElement>(null);

  const [showCommentModal, setShowCommentModal] = useState(false);

  const modalCommentPostRef = useRef<HTMLDivElement>(null);

  const [showMediaFullScreen, setShowMediaFullScreen] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalDeletePostRef.current &&
        !modalDeletePostRef.current.contains(event.target as Node)
      ) {
        setShowDeleteModal(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDeleteModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalDeletePostRef]);

  const modalMediaFullRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalMediaFullRef.current &&
        !modalMediaFullRef.current.contains(event.target as Node)
      ) {
        setShowMediaFullScreen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowMediaFullScreen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalMediaFullRef]);

  type Like = {
    authorId: string;
  };

  type Retweet = {
    authorId: string;
  };

  useEffect(() => {
    function authorLikedPost(authorId: string, likes: Like[]): boolean {
      return likes.some((like) => like.authorId === authorId);
    }
    function authorRetweetedPost(
      authorId: string,
      retweets: Retweet[]
    ): boolean {
      return retweets.some((retweet) => retweet.authorId === authorId);
    }
    if (user) {
      setLiked(authorLikedPost(user.id, post.likes));
      setRetweeted(authorRetweetedPost(user.id, post.retweets));
    } else {
      setRetweeted(false);
      setLiked(false);
    }
  }, [user, post.likes, post.retweets]);

  const [likes, setLikes] = useState(0);
  const [retweets, setRetweets] = useState(0);

  useEffect(() => {
    setLikes(post.likes.length);
    setRetweets(post.retweets.length);
  }, [post.likes, post.retweets.length]);

  const ctx = api.useContext();

  const { mutate, isLoading: isLiking } = api.posts.likePost.useMutation({
    onSuccess: () => {
      if (location.pathname === "/") {
        if (homePage) {
          void ctx.posts.infiniteScrollAllPosts?.invalidate();
        } else {
          void ctx.posts.infiniteScrollFollowerUsersPosts.invalidate();
        }
      } else if (/^\/[^\/]+\/likes/.test(location.pathname)) {
        // If the pathname starts with "/<string>/likes", invalidate `infiniteScrollPostsByUserIdLiked`
        void ctx.posts.infiniteScrollPostsByUserIdLiked.invalidate();
      } else if (location.pathname.startsWith("/post/")) {
        void ctx.posts.getById.invalidate();
      } else if (location.pathname.startsWith("/@")) {
        void ctx.posts.infiniteScrollPostsByUserId.invalidate();
      }
      console.log("Post Liked");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Like! Are you logged in?");
      }
    },
  });

  const { mutate: retweetPost, isLoading: isRetweeting } =
    api.posts.retweetPost.useMutation({
      onSuccess: () => {
        if (location.pathname === "/") {
          if (homePage) {
            void ctx.posts.infiniteScrollAllPosts?.invalidate();
          } else {
            void ctx.posts.infiniteScrollFollowerUsersPosts.invalidate();
          }
        } else if (/^\/[^\/]+\/likes/.test(location.pathname)) {
          // If the pathname starts with "/<string>/likes", invalidate `infiniteScrollPostsByUserIdLiked`
          void ctx.posts.infiniteScrollPostsByUserIdLiked.invalidate();
        } else if (location.pathname.startsWith("/post/")) {
          void ctx.posts.getById.invalidate();
        } else if (location.pathname.startsWith("/@")) {
          void ctx.posts.infiniteScrollPostsByUserId.invalidate();
        }
        console.log("Retweeted post");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Retweet! Are you logged in?");
        }
      },
    });

  const { mutate: editPost, isLoading: isEditingPostUpdating } =
    api.posts.editPost.useMutation({
      onSuccess: () => {
        if (location.pathname === "/") {
          void ctx.posts.infiniteScrollAllPosts.invalidate();
        } else if (/^\/[^\/]+\/likes/.test(location.pathname)) {
          // If the pathname starts with "/<string>/likes", invalidate `infiniteScrollPostsByUserIdLiked`
          void ctx.posts.infiniteScrollPostsByUserIdLiked.invalidate();
        } else if (location.pathname.startsWith("/post/")) {
          void ctx.posts.getById.invalidate();
        } else if (location.pathname.startsWith("/@")) {
          void ctx.posts.infiniteScrollPostsByUserId.invalidate();
        }

        console.log("Post Edited");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Edit! Are you the author?");
        }
      },
    });

  const { mutate: deletePost, isLoading: isDeletingPost } =
    api.posts.deletePost.useMutation({
      onSuccess: () => {
        setShowDeleteModal(false);
        if (location.pathname === "/") {
          void ctx.posts.infiniteScrollAllPosts.invalidate();
        } else if (/^\/[^\/]+\/likes/.test(location.pathname)) {
          // If the pathname starts with "/<string>/likes", invalidate `infiniteScrollPostsByUserIdLiked`
          void ctx.posts.infiniteScrollPostsByUserIdLiked.invalidate();
        } else if (location.pathname.startsWith("/post/")) {
          void ctx.posts.getById.invalidate();
        } else if (location.pathname.startsWith("/@")) {
          void ctx.posts.infiniteScrollAllPosts.invalidate();
        }

        console.log("Post Deleted");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Delete! Are you the author?");
        }
      },
    });

  const {
    mutate: deleteMediaCloudinary,
    isLoading: isDeletingMediaCloudinary,
  } = api.posts.deleteMediaCloudinary.useMutation({
    onSuccess: () => {
      console.log("Cloudinary Media Deleted");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to delete Media on Cloudinary!");
      }
    },
  });

  const { mutate: deleteMediaPost, isLoading: isDeletingMediaPost } =
    api.posts.deleteMediaPost.useMutation({
      onSuccess: (data) => {
        const publicId = data.public_id;
        if (publicId) {
          deleteMediaCloudinary({ publicId: publicId });
        }
        if (location.pathname === "/") {
          void ctx.posts.infiniteScrollAllPosts.invalidate();
        } else if (location.pathname.startsWith("/post/")) {
          void ctx.posts.getById.invalidate();
        } else if (/^\/[^\/]+\/likes/.test(location.pathname)) {
          // If the pathname starts with "/<string>/likes", invalidate `infiniteScrollPostsByUserIdLiked`
          void ctx.posts.infiniteScrollPostsByUserIdLiked.invalidate();
        } else if (location.pathname.startsWith("/@")) {
          void ctx.posts.infiniteScrollPostsByUserId.invalidate();
        }

        console.log("Post Image Deleted");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to delete Media! Are you the author?");
        }
      },
    });

  function handleSaveClick(newContent: string) {
    // Call the editPost mutation with the post id and the new content
    editPost({
      postId: post.id,
      content: newContent,
    });

    // Exit the editing mode
    setIsEditing(false);
  }

  const handleEditClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setTextLength(post.content.length);
    } else {
      handleSaveClick(textareaRef.current?.value as string);
    }
  };

  const [textLength, setTextLength] = useState(post.content.length);

  const [isTypingUsername, setIsTypingUsername] = useState(false);
  const [isTypingTrend, setIsTypingTrend] = useState(false);

  const [typedUsername, setTypedUsername] = useState("");
  const [typedTrend, setTypedTrend] = useState("");

  const [highlightedUser, setHighlightedUser] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prevHighlightedUser, setPrevHighlightedUser] = useState(-1);

  const [highlightedTrend, setHighlightedTrend] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prevhighlightedTrend, setPrevHighlightedTrend] = useState(-1);

  const userRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const trendRefs = useRef<React.RefObject<HTMLLIElement>[]>([]);

  const createMarkup = (text: string) => {
    return text.replace(/(@|#)\S+/g, '<span class="text-Intone-300">$&</span>');
  };

  const [highlightedInput, setHighlightedInput] = useState(
    createMarkup(post.content)
  );
  const [possibleTrends, setPossibleTrends] = useState<[string, number][]>([]);
  const [possibleUsernames, setPossibleUsernames] = useState<User[]>([]);

  useEffect(() => {
    const filteredUsernames = userList
      .filter(
        (user) =>
          user.username &&
          user.username.toLowerCase().includes(typedUsername.toLowerCase())
      )
      .map(({ id, username, profileImageUrl, firstName, lastName }) => ({
        id,
        username,
        profileImageUrl: profileImageUrl || "",
        firstName: firstName || "",
        lastName: lastName || "",
      }));
    if (filteredUsernames) {
      setPossibleUsernames(filteredUsernames.slice(0, 6));
      setHighlightedUser(0);
    }
  }, [userList, typedUsername]);

  useEffect(() => {
    // Filter trends based on typedTrend
    if (trends && !loadingTrends) {
      const filteredTrends = trends.filter(
        (trend) =>
          trend[0] && // Checking if trend name exists.
          trend[0].toLowerCase().includes(typedTrend.toLowerCase()) // Checking if trend name includes the typed trend.
      );

      // If filteredTrends exists, update possibleTrends.
      if (filteredTrends) {
        setPossibleTrends(filteredTrends.slice(0, 6)); // Limiting array to first 6 items.
        setHighlightedTrend(0);
      }
    }
  }, [trends, typedTrend, loadingTrends]);

  const selectUser = (highlightedUser: number) => {
    // Replace typed username with selected username
    const words = input.split(" ");
    const selectedUsername = possibleUsernames[highlightedUser]?.username ?? "";
    words[words.length - 1] = `@${selectedUsername}`;
    setInput(words.join(" "));

    // New array for highlighted words
    const highlightedWords: (string | undefined)[] = [];

    // Highlight all words that start with @ or #
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word) {
        // if word is not undefined
        if (word.startsWith("@") || word.startsWith("#")) {
          highlightedWords[i] = `<span class="text-Intone-300">${word}</span>`;
        } else {
          highlightedWords[i] = words[i];
        }
      }
    }

    const highlightedInput = highlightedWords.join(" ");
    setHighlightedInput(highlightedInput);
    setTextLength(words.join(" ").length);
    // Stop showing the drop-down
    setIsTypingUsername(false);
  };

  const selectTrend = (highlightedTrend: string) => {
    // Replace typed username with selected username
    const words = input.split(" ");
    const selectedTrend = highlightedTrend;
    words[words.length - 1] = `${selectedTrend}`;
    setInput(words.join(" "));

    // New array for highlighted words
    const highlightedWords: (string | undefined)[] = [];

    // Highlight all words that start with @ or #
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word) {
        // if word is not undefined
        if (word.startsWith("@") || word.startsWith("#")) {
          highlightedWords[i] = `<span class="text-Intone-300">${word}</span>`;
        } else {
          highlightedWords[i] = words[i];
        }
      }
    }

    const highlightedInput = highlightedWords.join(" ");
    setHighlightedInput(highlightedInput);
    setTextLength(words.join(" ").length);

    // Stop showing the drop-down
    setIsTypingTrend(false);
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);
    setTextLength(event.target.textLength);

    const words = event.target.value.split(" ");
    const lastWord = words[words.length - 1];

    // Create the highlighted HTML version of the entered text
    const createMarkup = (text: string) => {
      return text.replace(
        /(@|#)\S+/g,
        '<span class="text-Intone-300">$&</span>'
      );
    };

    setHighlightedInput(createMarkup(event.target.value));

    if (lastWord) {
      if (lastWord.startsWith("@") && lastWord.length > 1) {
        if (possibleUsernames.length === 0) {
          setIsTypingUsername(false);
          setHighlightedUser(0);
        } else {
          setIsTypingUsername(true);
        }
        setTypedUsername(lastWord.slice(1));
      } else if (lastWord.startsWith("#") && lastWord.length > 1) {
        if (possibleTrends.length === 0) {
          setHighlightedTrend(0);
          setIsTypingTrend(false);
        } else {
          setIsTypingTrend(true);
        }
        setTypedTrend(lastWord.slice(1));
      } else {
        setHighlightedUser(0);
        setIsTypingUsername(false);
      }
    } else {
      setHighlightedUser(0);
      setHighlightedTrend(0);
      setIsTypingUsername(false);
      setIsTypingTrend(false);
    }
  };

  async function copyToClipboard() {
    let urlBase = window.location.hostname;

    if (window.location.hostname === "localhost") {
      urlBase = "http://localhost:3000";
    }
    const url = urlBase + "/post" + `/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy URL.");
      console.error(err);
    }
  }

  return (
    <div
      key={post.id}
      className="flex gap-3 border-b border-slate-400 p-4 phone:relative"
    >
      <Image
        className="h-14 w-14 rounded-full phone:absolute phone:bottom-4 phone:right-1 phone:h-10 phone:w-10"
        src={author?.profileImageUrl}
        alt={`@${author.username}profile picture`}
        width={56}
        height={56}
      />
      <div className="relative flex w-full flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            @
            <span className="hover:text-white hover:underline">{`${author.username}`}</span>
          </Link>
          <span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
          {post.isEdited && (
            <>
              <p
                className="text-3xl text-slate-100"
                data-tooltip-id="edited-tooltip"
                data-tooltip-content="This post was edited."
              >
                *
              </p>
              <Tooltip
                id="edited-tooltip"
                place="bottom"
                style={{
                  borderRadius: "24px",
                  backgroundColor: "rgb(51 65 85)",
                }}
              />
            </>
          )}
        </div>
        <span
          className={`${
            !isEditing ? "hover:bg-slate-900" : ""
          } rounded-2xl px-2 py-1`}
          onMouseUp={(event) => {
            event.stopPropagation();
            const selectedText = window.getSelection()?.toString();
            if (!isEditing && !selectedText) {
              void router.push(`/post/${post.id}`);
            }
          }}
        >
          {isTypingUsername && (
            <ul
              className="gray-thin-scrollbar absolute right-8 top-20 z-10 flex 
            max-h-[250px] w-fit max-w-[350px]
            flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl"
            >
              {possibleUsernames.map((user, index) => {
                if (!userRefs.current[index]) {
                  userRefs.current[index] = React.createRef<HTMLDivElement>();
                }

                return (
                  <UserCard
                    key={index}
                    user={user}
                    index={index}
                    setInput={setInput}
                    input={input}
                    setIsTypingUsername={setIsTypingUsername}
                    setTextLength={setTextLength}
                    highlightedUser={highlightedUser}
                    scrollRef={
                      userRefs.current?.[index] ||
                      React.createRef<HTMLDivElement>()
                    }
                  />
                );
              })}
            </ul>
          )}
          {isTypingTrend && possibleTrends.length > 0 && (
            <ul
              className="gray-thin-scrollbar absolute right-8 top-20 z-10 flex 
            max-h-[250px] w-fit min-w-[200px]
            max-w-[350px] flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl"
            >
              {!trends && <LoadingSpinner />}
              {possibleTrends &&
                possibleTrends.map((trend, index) => {
                  if (!trendRefs.current[index]) {
                    trendRefs.current[index] = React.createRef<HTMLLIElement>();
                  }
                  return (
                    <li
                      ref={
                        trendRefs.current?.[index] ||
                        React.createRef<HTMLLIElement>()
                      }
                      className={`${
                        index == highlightedTrend ? "bg-Intone-200" : ""
                      } px-4 py-2   hover:bg-Intone-200`}
                      onClick={() => selectTrend(trend[0])}
                      key={`${trend[0]}+${trend[1]}`}
                    >
                      {trend[0]}
                    </li>
                  );
                })}
            </ul>
          )}
          {isEditing ? (
            <div className="relative">
              <button
                className="absolute right-0 top-4 z-10
          rounded-3xl px-1 py-1 hover:bg-slate-700 hover:text-white
          "
                onClick={() => {
                  setIsEditing(false);
                  setIsTypingTrend(false);
                  setIsTypingUsername(false);
                }}
              >
                <FontAwesomeIcon
                  className="h-6 w-6 rounded-3xl"
                  icon={faXmark}
                />
              </button>
              <h1 className="absolute right-8 top-0 rounded-3xl">
                {textLength}/280
              </h1>
              <div className="relative w-full">
                <div
                  className="pointer-events-none absolute pb-2 pl-4 pr-8 pt-4 text-transparent"
                  dangerouslySetInnerHTML={{
                    __html: highlightedInput.replace(/\n/g, "<br/>"),
                  }}
                />
                <TextareaAutosize
                  maxLength={280}
                  ref={textareaRef}
                  className="h-full min-h-[80px] w-full resize-none max-h-[45vh] gray-thin-scrollbar
                rounded-3xl border-slate-400 bg-slate-900 pb-2 pl-4 pr-8 pt-4 outline-none"
                  //defaultValue={post.content}
                  value={input}
                  onChange={(e) => handleTextareaChange(e)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "ArrowDown" &&
                      (isTypingTrend || isTypingUsername)
                    ) {
                      // Down arrow key pressed
                      e.preventDefault();
                      if (
                        isTypingUsername &&
                        highlightedUser < possibleUsernames.length - 1
                      ) {
                        setPrevHighlightedUser(highlightedUser);
                        setHighlightedUser((prevHighlightedUser) => {
                          const nextHighlightedUser = prevHighlightedUser + 1;
                          const nextRef = userRefs.current[nextHighlightedUser];
                          if (nextRef && nextRef.current) {
                            nextRef.current.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          }
                          return nextHighlightedUser;
                        });
                      } else if (
                        isTypingTrend &&
                        trends &&
                        highlightedTrend < possibleTrends?.length - 1
                      ) {
                        setPrevHighlightedTrend(highlightedTrend);
                        setHighlightedTrend((prevhighlightedTrend) => {
                          const nextHighlightedTrend = prevhighlightedTrend + 1;
                          const nextRef =
                            trendRefs.current[nextHighlightedTrend];
                          if (nextRef && nextRef.current) {
                            nextRef.current.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          }
                          return nextHighlightedTrend;
                        });
                      }
                    } else if (
                      e.key === "ArrowUp" &&
                      (isTypingTrend || isTypingUsername)
                    ) {
                      // Up arrow key pressed
                      e.preventDefault();
                      if (highlightedUser > 0 && isTypingUsername) {
                        setPrevHighlightedUser(highlightedUser);
                        setHighlightedUser((prevHighlightedUser) => {
                          const nextHighlightedUser = prevHighlightedUser - 1;
                          const nextRef = userRefs.current[nextHighlightedUser];
                          if (nextRef && nextRef.current) {
                            nextRef.current.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          }
                          return nextHighlightedUser;
                        });
                      } else if (
                        isTypingTrend &&
                        trends &&
                        highlightedTrend > 0
                      ) {
                        setPrevHighlightedTrend(highlightedTrend);
                        setHighlightedTrend((prevhighlightedTrend) => {
                          const nextHighlightedTrend = prevhighlightedTrend - 1;
                          const nextRef =
                            trendRefs.current[nextHighlightedTrend];
                          if (nextRef && nextRef.current) {
                            nextRef.current.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          }
                          return nextHighlightedTrend;
                        });
                      }
                    } else if (e.key === "Tab") {
                      // Split input into an array of words
                      const words = input.split(" ");
                      // Get the last word
                      const lastWord = words.slice(-1)[0];
                      // Check if the last word isn't just an @ or a #
                      if (
                        (lastWord && lastWord.length > 1 && isTypingTrend) ||
                        isTypingUsername
                      ) {
                        e.preventDefault();
                        if (isTypingUsername) {
                          selectUser(highlightedUser);
                        } else if (isTypingTrend) {
                          // This is a placeholder
                          selectTrend(
                            possibleTrends[highlightedTrend]?.[0] ?? ""
                          );
                        }
                        // Tab key pressed
                        // Select the currently highlighted user
                      }
                    }
                  }}
                />
              </div>
            </div>
          ) : isEditingPostUpdating ? (
            <div className="mx-auto flex justify-center">
              <LoadingSpinner size={32} />
            </div>
          ) : (
            <span className="select-text text-2xl sm:whitespace-pre-wrap">
              <PostContent content={post.content} />
            </span>
          )}
          <br />
        </span>
        {post.imageUrl && (
          <div className="mx-auto my-4 w-full">
            {isDeletingMediaPost ? (
              <LoadingSpinner />
            ) : (
              <div
                className="relative flex h-[400px] w-auto cursor-pointer justify-center border-slate-200"
                onClick={() => {
                  if (!isEditing) {
                    setShowMediaFullScreen(true);
                  }
                }}
              >
                <AdvancedImage
                  style={{
                    width: "auto",
                    height: "auto",
                    maxHeight: "400px",
                    borderWidth: "1px",
                    borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                    borderRadius: "0.375rem",
                    borderStyle: "solid",
                    overflow: "clip",
                    twBorderOpacity: "1",
                  }}
                  cldImg={cld.image(post.imageUrl)}
                  /* plugins={[
                  lazyload({
                    rootMargin: "10px 20px 10px 30px",
                    threshold: 0.25,
                  }),
                ]} */
                />
                {isEditing && (
                  <button
                    onClick={() =>
                      deleteMediaPost({ postId: post.id, mediaType: "image" })
                    }
                    className="absolute right-0 top-0 z-10 mt-2 rounded-3xl border
             border-slate-400 bg-Intone-200 px-4 py-1 hover:bg-slate-700"
                  >
                    Delete Image
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {post.gifUrl && (
          <div className="mx-auto my-4 w-full">
            {isDeletingMediaPost || isDeletingMediaCloudinary ? (
              <LoadingSpinner />
            ) : (
              <div
                className="relative flex h-[400px] w-auto cursor-pointer justify-center border-slate-200"
                onClick={() => {
                  if (!isEditing) {
                    setShowMediaFullScreen(true);
                  }
                }}
              >
                <AdvancedImage
                  style={{
                    width: "auto",
                    height: "auto",
                    maxHeight: "400px",
                    borderWidth: "1px",
                    borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                    borderRadius: "0.375rem",
                    borderStyle: "solid",
                    overflow: "clip",
                    twBorderOpacity: "1",
                  }}
                  cldImg={cld.image(post.gifUrl)}
                />
                {isEditing && (
                  <button
                    onClick={() =>
                      deleteMediaPost({ postId: post.id, mediaType: "gif" })
                    }
                    className="absolute right-0 top-0 z-10 mt-2 rounded-3xl border
             border-slate-400 bg-Intone-200 px-4 py-1 hover:bg-slate-700"
                  >
                    Delete Gif
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {showMediaFullScreen && (
          <div className="modalparent">
            <div
              ref={modalMediaFullRef}
              className="modal relative flex w-fit h-[85vh] items-center 
            justify-center rounded-xl border border-slate-400 bg-black p-4"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="absolute right-12 top-6 h-7 w-7 cursor-pointer rounded-3xl bg-black px-1"
                onClick={() => setShowMediaFullScreen(false)}
              />
              {post.gifUrl && (
                <AdvancedImage
                  style={{
                    objectFit: "fill",
                    maxWidth: "85vw",
                    maxHeight: "80vh",
                    width: 'auto',
                    heigth: 'auto',
                    borderWidth: "1px",
                    borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                    borderRadius: "0.375rem",
                    borderStyle: "solid",
                    overflow: "clip",
                    twBorderOpacity: "1",
                  }}
                  cldImg={cld.image(post.gifUrl)}
                />
              )}
              {post.imageUrl && (
                <AdvancedImage
                  style={{
                    objectFit: "fill",
                    maxWidth: "85vw",
                    maxHeight: "80vh",
                    width: 'auto',
                    heigth: 'auto',
                    borderWidth: "1px",
                    borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                    borderRadius: "0.375rem",
                    borderStyle: "solid",
                    overflow: "clip",
                    twBorderOpacity: "1",
                  }}
                  cldImg={cld.image(post.imageUrl)}
                />
              )}
            </div>
          </div>
        )}

        <div className={`flex flex-row gap-2 sm:gap-4 md:gap-8 lg:gap-12 `}>
          <button
            data-tooltip-id="like-tooltip"
            data-tooltip-content="Like"
            disabled={isLiking}
            onClick={() => mutate({ postId: post.id })}
            className={`flex w-fit origin-center transform cursor-pointer flex-row items-center text-3xl transition-all duration-300 
          ${liked ? "text-red-600" : "hover:text-red-300"} whitespace-normal ${
              isLiking
                ? "scale-125 animate-pulse text-red-900"
                : "hover:scale-110"
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className="mr-2 h-6 w-6" />{" "}
            <p>{likes}</p>
          </button>
          <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="like-tooltip"
          />

          <button
            data-tooltip-id="comment-tooltip"
            data-tooltip-content="Comment"
            onClick={() =>setShowCommentModal(true)}
          >
            {" "}
            <FontAwesomeIcon
              icon={faComment}
              className="post-button-fontAwesome"
            />{" "}
          </button>

          <button
            onClick={() => retweetPost({ postId: post.id })}
            className={`flex w-fit origin-center transform cursor-pointer flex-row items-center text-3xl transition-all duration-300 
        ${
          retweeted ? "text-green-600" : "hover:text-green-300"
        } whitespace-normal ${
              isRetweeting
                ? "text-green-900-900 scale-125 animate-pulse"
                : "hover:scale-110"
            }`}
            data-tooltip-id="retweet-tooltip"
            data-tooltip-content="Retweet"
          >
            {" "}
            <FontAwesomeIcon icon={faRetweet} className="h-6 w-6 rounded-3xl" />
            <p className="ml-1">{retweets}</p>{" "}
          </button>
          <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="retweet-tooltip"
          />
          {showShareModal && (
            <div className="modalparent">
              <div
                className="modal grid w-[80vw] grid-flow-row grid-cols-1 rounded-lg border
               border-slate-400 bg-black p-4 md:w-[35vw]"
              >
                <button
                  className="absolute right-2 top-4 rounded-3xl
          px-1 py-1 hover:bg-slate-700 hover:text-white
          "
                  onClick={() => setShowShareModal(false)}
                >
                  <FontAwesomeIcon
                    className="h-6 w-6 rounded-3xl"
                    icon={faXmark}
                  />
                </button>
                <h2 className="mx-auto font-semibold">Share with:</h2>
                <div className="grid grid-flow-row-dense grid-cols-3 rounded-3xl border p-6 md:grid-cols-3">
                  <button
                    data-tooltip-id="copyLink-tooltip"
                    data-tooltip-content="Copy to Clipboard"
                    className="my-2 flex flex-col items-center  justify-center rounded-xl hover:bg-gray-700"
                    onClick={() => {
                      void copyToClipboard();
                    }}
                  >
                    <FontAwesomeIcon icon={faCopy} className="h-8 w-8" />
                    Copy Link
                  </button>
                  <Tooltip
                    place="left"
                    style={{
                      borderRadius: "24px",
                      backgroundColor: "rgb(51 65 85)",
                    }}
                    id="copyLink-tooltip"
                  />
                  <TwitterShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      <TwitterIcon size={32} round={true} />

                      <p className="phone:hidden">Twitter</p>
                    </span>
                  </TwitterShareButton>
                  <WhatsappShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      {" "}
                      <WhatsappIcon size={32} round={true} />
                      <p className="phone:hidden">Whatsapp</p>
                    </span>
                  </WhatsappShareButton>
                  <TelegramShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      {" "}
                      <TelegramIcon size={32} round={true} />
                      <p className="phone:hidden">Telegram</p>
                    </span>
                  </TelegramShareButton>
                  <LinkedinShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      {" "}
                      <LinkedinIcon size={32} round={true} />
                      <p className="phone:hidden">Linkedin</p>
                    </span>
                  </LinkedinShareButton>
                  <EmailShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      {" "}
                      <EmailIcon size={32} round={true} />
                      <p className="phone:hidden">Email</p>
                    </span>
                  </EmailShareButton>
                  <VKShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    {" "}
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      <VKIcon size={32} round={true} />

                      <p className="phone:hidden">Vk</p>
                    </span>
                  </VKShareButton>
                  <RedditShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    {" "}
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      <RedditIcon size={32} round={true} />
                      <p className="phone:hidden">Reddit</p>
                    </span>
                  </RedditShareButton>
                  <ViberShareButton
                    url={window.location.hostname + "/post" + `/${post.id}`}
                  >
                    {" "}
                    <span className="flex flex-col items-center justify-center rounded-xl py-2 hover:bg-gray-700">
                      <ViberIcon size={32} round={true} />
                      <p className="phone:hidden">Viber</p>
                    </span>
                  </ViberShareButton>
                </div>
              </div>
            </div>
          )}
          {showCommentModal && (
                    <div
                      className={`modalparent transform transition-transform duration-300 ease-in-out ${
                        showCommentModal
                          ? "visible scale-100 opacity-100"
                          : "invisible scale-0 opacity-0"
                      }`}
                    >
                      <div
                        ref={modalCommentPostRef}
                        className="modalDeletePost mx-auto flex h-fit w-[35vw] flex-col
        rounded-3xl border border-indigo-200 bg-black p-8"
                      >
                        <CreatePostWizard homePage={homePage} />
                        <button
                          className="rounded-3xl border px-2 py-2 mt-2 w-fit hover:bg-Intone-700"
                          onClick={() => setShowCommentModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

          <button
            onClick={() => setShowShareModal(true)}
            data-tooltip-id="share-tooltip"
            data-tooltip-content="Share"
          >
            {" "}
            <FontAwesomeIcon
              icon={faShare}
              className="post-button-fontAwesome"
            />{" "}
          </button>
          <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="share-tooltip"
          />
          {user?.id === author.id && (
            <>
              <button
                data-tooltip-id="editPost-tooltip"
                data-tooltip-content="Edit Post"
                onClick={handleEditClick}
                className="rounded-3xl border border-slate-400 px-4 py-1 hover:bg-slate-700"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
              <Tooltip
                place="bottom"
                style={{
                  borderRadius: "24px",
                  backgroundColor: "rgb(51 65 85)",
                }}
                id="editPost-tooltip"
              />
              {!isDeletingPost ? (
                <>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    data-tooltip-id="delete-tooltip"
                    data-tooltip-content="Delete"
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon className="h-6 w-6" icon={faXmark} />
                  </button>
                  <Tooltip
                    place="bottom"
                    style={{
                      borderRadius: "24px",
                      backgroundColor: "rgb(51 65 85)",
                    }}
                    id="delete-tooltip"
                  />
                  {showDeleteModal && (
                    <div
                      className={`modalparent transform transition-transform duration-300 ease-in-out ${
                        showDeleteModal
                          ? "visible scale-100 opacity-100"
                          : "invisible scale-0 opacity-0"
                      }`}
                    >
                      <div
                        ref={modalDeletePostRef}
                        className="modalDeletePost mx-auto flex h-fit w-96 flex-col
        rounded-3xl border border-indigo-200 bg-black p-8"
                      >
                        <h2 className="text-2xl font-semibold">Delete Post?</h2>

                        <p className="text-gray-500">
                          This can{`'`}t be undone and it will be removed from
                          your profile, the timeline of any accounts that follow
                          you, and from search results.
                        </p>
                        <button
                          className="my-4 rounded-3xl bg-red-700 px-2 py-2 hover:bg-red-800"
                          onClick={() => deletePost({ postId: post.id })}
                        >
                          Delete
                        </button>
                        <button
                          className="rounded-3xl border px-2 py-2"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <LoadingSpinner />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

PostViewComponent.displayName = "PostView";

export const PostView = React.memo(PostViewComponent);
