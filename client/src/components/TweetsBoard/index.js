import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { FaRegComment, FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import {
  Container,
  HeaderWrapper,
  Header,
  List,
  ListItem,
  ListItemContent,
  TweetUserGroup,
  TweetText,
  TweetBottomGroup,
  TweetUserName,
  TweetUserUsername,
  ItemGroup,
  DeleteButton,
} from './style';
import {
  InfoText,
  UserAvatar,
  Icon,
  LikeIcon,
  Button,
} from 'shared/components';
import Loading from 'components/Loading';
import portraitPlaceholder from 'img/portrait-placeholder.png';
import { useUser } from 'context/UserContext';
import { useRemoveTweet, useTweetLike, useTweetUnlike } from 'utils/tweets';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
import 'styled-components/macro';

function SingleTweet({ tweet }) {
  const user = useUser();
  const history = useHistory();
  const removeTweetMutation = useRemoveTweet();
  const likeTweetMutation = useTweetLike();
  const unlikeTweetMutation = useTweetUnlike();

  const handleTweetClick = (tweet) => {
    const { author, _id: tweetId } = tweet;
    history.push({
      pathname: `/${author._id}/status/${tweetId}`,
      state: { modal: true },
    });
  };

  const handleActionClick = (action, tweetId) => (e) => {
    e.stopPropagation();
    if (user) {
      if (action === 'like') {
        likeTweetMutation.mutate(tweetId);
      } else if (action === 'unlike') {
        unlikeTweetMutation.mutate(tweetId);
      } else if (action === 'remove') {
        removeTweetMutation.mutate(tweetId);
      }
    } else {
      history.push({
        pathname: '/signin',
      });
    }
  };
  const owner = user && user._id === tweet.author._id;
  const liked = !!(user && tweet.likes.includes(user._id));

  return (
    <ListItem key={tweet._id} onClick={() => handleTweetClick(tweet)}>
      <UserAvatar
        small
        src={tweet.author.avatar || portraitPlaceholder}
        alt="User Avatar"
      />
      <ListItemContent>
        <TweetUserGroup>
          <ItemGroup>
            <TweetUserName>{tweet.author.name}</TweetUserName>
          </ItemGroup>
          <ItemGroup>
            @<TweetUserUsername>{tweet.author.username}</TweetUserUsername>
          </ItemGroup>
          <ItemGroup>
            <span>{format(new Date(tweet.createdAt), 'MMMM yyyy')}</span>
          </ItemGroup>
        </TweetUserGroup>
        <div>
          <TweetText>{tweet.text}</TweetText>
        </div>
        <TweetBottomGroup>
          <button>
            <Icon as={FaRegComment} /> <span>{tweet.repliesCount}</span>
          </button>
          <button
            onClick={handleActionClick(liked ? 'unlike' : 'like', tweet._id)}
          >
            <LikeIcon liked={liked}>
              {liked ? <FaHeart /> : <FaRegHeart />}
            </LikeIcon>{' '}
            {tweet.likes.length}
          </button>
        </TweetBottomGroup>
      </ListItemContent>
      {owner ? (
        <DeleteButton
          onClick={handleActionClick('remove', tweet._id)}
          disabled={removeTweetMutation.isLoading}
        >
          <IoMdClose />
        </DeleteButton>
      ) : null}
    </ListItem>
  );
}

SingleTweet.propTypes = {
  tweet: PropTypes.object.isRequired,
};

function TweetsBoard({
  loading,
  pages,
  headerText,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
}) {
  const loadMoreRef = useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  const numberOfTweets =
    pages?.reduce((acc, page) => acc + page.results.length, 0) ?? 0;

  return (
    <Container>
      <HeaderWrapper>
        <Header>{headerText}</Header>
      </HeaderWrapper>
      {loading ? (
        <Loading />
      ) : (
        <>
          <List>
            {numberOfTweets > 0 ? (
              <>
                {pages.map((group, i) => (
                  <React.Fragment key={i}>
                    {group.results.map((tweet) => (
                      <SingleTweet key={tweet._id} tweet={tweet} />
                    ))}
                  </React.Fragment>
                ))}

                <div
                  css={`
                    margin-top: 15px;
                    display: flex;
                    justify-content: center;
                  `}
                >
                  <Button
                    ref={loadMoreRef}
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                  >
                    {isFetchingNextPage
                      ? 'Loading more...'
                      : hasNextPage
                      ? 'Load More'
                      : 'Nothing more to load'}
                  </Button>
                </div>
              </>
            ) : (
              <InfoText>There are no tweets to display</InfoText>
            )}
          </List>

          <InfoText>
            {isFetching && !isFetchingNextPage ? 'Fetching...' : null}
          </InfoText>
        </>
      )}
    </Container>
  );
}

TweetsBoard.defaultProps = {
  headerText: 'Tweets',
};

TweetsBoard.propTypes = {
  loading: PropTypes.bool.isRequired,
  pages: PropTypes.array.isRequired,
  headerText: PropTypes.string.isRequired,
  fetchNextPage: PropTypes.func.isRequired,
  hasNextPage: PropTypes.bool,
  isFetchingNextPage: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default TweetsBoard;