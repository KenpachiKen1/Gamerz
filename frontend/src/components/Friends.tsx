import { useEffect, useState } from "react";
import { Avatar, Button, List, Modal, Input, Typography, Tabs } from "antd";
import Grow from "@mui/material/Grow";
import { CloseOutlined } from "@ant-design/icons";

import { useFriends } from "../context/FriendsContext";
import "../styles/Friends.css";

const { Search } = Input;
const { Text } = Typography;

type FriendshipStatus = {
  status: string;
  is_sender: boolean;
};

type FriendUser = {
  id: number;
  username: string;
  profile_photo?: string | null;
  profile_picture?: string | null;
  avg_hours_week?: number | null;
  hours?: number | null;
  main_platform?: string | null;
  friendship_status?: FriendshipStatus;
};

type ProfileType = {
  username: string;
};

type FriendsProps = {
  Profile: ProfileType;
};

const Friends = ({ Profile }: FriendsProps) => {
  const {
    search,
    setSearch,
    friendsList,
    pendingList,
    remove_friend,
    add_friend,
    accept_friend_request,
    decline_friend_request,
    show_friends,
    show_pending,
    user_search,
    users,
  } = useFriends();

  const [friendModal, setFriendModal] = useState<boolean>(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [friendToRemove, setFriendToRemove] = useState<string | null>(null);
  const [tabKey, setTabKey] = useState<string>("1");
  const [filter, setFiltered] = useState<FriendUser[]>([]);

  

  useEffect(() => {
    if (Profile) {
      void show_pending();
      void show_friends();
    }
  }, [Profile]);

  useEffect(() => {
    setFiltered(friendsList);
  }, [friendsList]);

  const handle_user_search = async (user: string) => {
    await user_search(user);
  };

  const handle_accept = async (user: string) => {
    await accept_friend_request(user);
  };

  const handleFriendAdd = async (username: string) => {
    setSentRequests((prev) => [...prev, username]);
    await add_friend(username);
  };

  const handle_decline = async (user: string) => {
    await decline_friend_request(user);
  };

  const handle_remove_friend = async (user: string) => {
    await remove_friend(user);
  };

  const handleFriendLookup = (username: string) => {
    if (username === "" || friendsList.length === 0) {
      setFiltered(friendsList);
      return;
    }

    const list_to_return = friendsList.filter((user) =>
      user.username.toLowerCase().includes(username.toLowerCase())
    );

    setFiltered(list_to_return);
  };

  const pending = () => {
    return (
      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          paddingRight: "10px",
        }}
      >
        {pendingList.map((user, index) => (
          
          <Grow in key={user.id || index}>
            <div
              className="list"
              style={{
                borderBottom: "1px solid #f0f0f0",
                padding: "16px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  size="large"
                  style={{ margin: "5px" }}
                  src={user.profile_photo ?? user.profile_picture ?? null}
                />
                <h3 style={{ marginLeft: 10 }}>{user.username}</h3>
              </div>
              <div style={{ margin: "5px 0 0 5px" }}>
                {user.avg_hours_week ?? user.hours ? (
                  <h4>
                    Average gaming hours: {user.avg_hours_week ?? user.hours}
                  </h4>
                ) : (
                  <h4>Average gaming hours not set</h4>
                )}

                {user.main_platform ? (
                  <h4>Main Platform: {user.main_platform}</h4>
                ) : (
                  <h4>Main Platform not chosen</h4>
                )}

                {
                  user.friendship_status?.is_sender === true ? (
                  <Button disabled>Friend Request Pending</Button>
                ) : (
                  <div className="friend-actions">
                    <Button
                      key={index}
                      className="btn-accept"
                      onClick={() => handle_accept(user.username)}
                    >
                      Accept
                    </Button>
                    <Button
                      className="btn-decline"
                      onClick={() => handle_decline(user.username)}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Grow>
        ))}
      </div>
    );
  };

  const friends = () => {
    return (
      <>
        <Modal
          title={<h2>Remove {friendToRemove}?</h2>}
          open={!!friendToRemove}
          closable
          onCancel={() => setFriendToRemove(null)}
          onOk={() => {
            if (friendToRemove) handle_remove_friend(friendToRemove);
            setFriendToRemove(null);
          }}
        >
          <h2>You can add them back any time</h2>
        </Modal>

        <div
          style={{
            maxHeight: "500px",
            overflowY: "auto",
            paddingRight: "10px",
          }}
        >
          <div style={{ display: "flex", margin: "5px" }}>
            <Text strong style={{ margin: "5px" }}>
              Filter:
            </Text>
            <Input
              onChange={(e) => handleFriendLookup(e.target.value)}
              style={{ width: "450px" }}
            />
          </div>

          {filter.map((user, index) => (
            <Grow in key={user.id || index}>
              <div
                className="list"
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  padding: "16px 0",
                }}
              >
                <div style={{ position: "relative" }}>
                  <CloseOutlined
                    style={{
                      position: "absolute",
                      right: 10,
                      top: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => setFriendToRemove(user.username)}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    size="large"
                    style={{ margin: "5px" }}
                    src={user.profile_photo ?? user.profile_picture ?? null}
                  />
                  <h3 style={{ marginLeft: 10 }}>{user.username}</h3>
                </div>

                <div style={{ margin: "5px 0 0 5px" }}>
                  {user.avg_hours_week ?? user.hours ? (
                    <h4>
                      Average gaming hours: {user.avg_hours_week ?? user.hours}
                    </h4>
                  ) : (
                    <h4>Average gaming hours not set</h4>
                  )}

                  {user.main_platform ? (
                    <h4>Main Platform: {user.main_platform}</h4>
                  ) : (
                    <h4>Main Platform not chosen</h4>
                  )}
                </div>
              </div>
            </Grow>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="friends-shell">
      <Tabs
        centered
        activeKey={tabKey}
        onChange={setTabKey}
        items={[
          {
            label: <Text>Friends ({friendsList.length})</Text>,
            key: "1",
            children: friends(),
          },
          {
            label: <Text>Pending ({pendingList.length})</Text>,
            key: "2",
            children: pending(),
            disabled: pendingList.length <= 0,
          },
        ]}
      />
      <br />
      <Button
        onClick={() => setFriendModal(true)}
        style={{ margin: "3px", marginBottom: "15px" }}
      >
        Search for users
      </Button>
      <Modal
        title="Search for users to add"
        style={{ color: "#343434" }}
        open={friendModal}
        onCancel={() => setFriendModal(false)}
        footer={null}
      >
        <Search
          placeholder="Search for users"
          enterButton
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => handle_user_search(search)}
        />

        {users.length > 0 ? (
          <List
            style={{ padding: "3px", margin: "5px" }}
            itemLayout="vertical"
            pagination={{ pageSize: 2 }}
            dataSource={users}
            renderItem={(user) => (
              <Grow in key={user.id}>
                <List.Item className="list">
                  <List.Item.Meta
                    title={user.username}
                    avatar={
                      <Avatar
                        size="large"
                        style={{ margin: "5px" }}
                        src={user.profile_photo ?? user.profile_picture ?? null}
                      />
                    }
                  />

                  <div style={{ margin: "5px", color: "#343434" }}>
                    {user.avg_hours_week ?? user.hours ? (
                      <h4>
                        Average gaming hours:{" "}
                        {user.avg_hours_week ?? user.hours}
                      </h4>
                    ) : (
                      <h4>Average gaming hours not set</h4>
                    )}

                    {user.main_platform ? (
                      <h4>Main Platform: {user.main_platform}</h4>
                    ) : (
                      <h4>Main Platform not chosen</h4>
                    )}
                  </div>

                  <div>
                    {Profile.username === user.username ? (
                      <Button
                        style={{
                          margin: "3px",
                          bottom: 0,
                          right: -240,
                        }}
                      >
                        Click for a random fact
                      </Button>
                    ) : (
                      <div style={{ margin: "3px", width: "100%" }}>
                        {user.friendship_status &&
                        user.friendship_status.status !== "NOT_FRIENDS" ? (
                          <Button
                            style={{
                              backgroundColor: "lightgreen",
                              color: "white",
                              right: -250,
                            }}
                            disabled
                          >
                            Friend request sent
                          </Button>
                        ) : (
                          <Button
                            key={user.username}
                            onClick={() => handleFriendAdd(user.username)}
                            disabled={sentRequests.includes(user.username)}
                            style={{
                              backgroundColor: sentRequests.includes(
                                user.username
                              )
                                ? "lightgreen"
                                : "green",
                              color: "white",
                              transition: "0.3s ease",
                              right: -350,
                            }}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </List.Item>
              </Grow>
            )}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default Friends;
