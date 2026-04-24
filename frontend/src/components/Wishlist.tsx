import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  List,
  Empty,
  Typography,
  Modal,
  Input,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { useAccount } from "../context/ProfileContext";
import GamesDisplay from "./GamesDisplay";
import useNotifications from "./useNotifications";
import "../styles/wishlist.css";

type Game = {
  id?: number;
  name?: string;
  title?: string;
  released?: string | null;
  game_image?: string | null;
  description?: string | null;
  platform?: string[] | string | null;
};

type ProfileType = {
  username: string;
  wishlist_name: string | null;
  profile_photo?: string | null;
  profile_picture?: string | null;
  main_platform?: string | null;
  avg_hours_week?: number | null;
  hours?: number | null;
  favorite_game?: {
    id?: number;
    name?: string;
    title?: string;
  } | null;
};

type WishlistProps = {
  Profile: ProfileType;
  onChanged?: () => Promise<void> | void;
};

const Wishlist = ({ Profile, onChanged }: WishlistProps) => {
  const {
    create_wishlist,
    add_to_wishlist,
    show_wishlist,
    userGames,
    delete_wishlist,
    remove_from_wishlist,
  } = useAccount();

  const [open, setOpen] = useState<boolean>(false);
  const [wishname, setWishName] = useState<string>("");
  const [games, setGames] = useState<string | null>(null);
  const [gameModal, setGameModal] = useState<boolean>(false);
  const [infoModal, setInfoModal] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const { showNotification, contextHolder } = useNotifications();

  useEffect(() => {
    if (Profile) {
      show_wishlist();
    }
  }, [Profile, show_wishlist]);

  const handleCreate = async (name: string) => {
    await create_wishlist(name);
    await show_wishlist();
    await onChanged?.();
  };

  const handleAdd = async (game: string | null) => {
    if (!game) return;
    await add_to_wishlist(game);
    await show_wishlist();
    await onChanged?.();
  };

  const handleShow = async () => {
    await show_wishlist();
  };

  const handleRemove = async (game: string) => {
    await remove_from_wishlist(game);
    await show_wishlist();
    await onChanged?.();
  };

  const openGameModal = (game: Game) => {
    setSelectedGame(game);
    setInfoModal(true);
  };

  const closeGameModal = () => {
    setSelectedGame(null);
    setInfoModal(false);
  };

  const handleWishlistDeletion = async () => {
    setDeleteModal(false);
    await delete_wishlist();
    await onChanged?.();
  };

  const displayName = selectedGame?.name ?? selectedGame?.title ?? "Unknown";

  return (
    <>
      {contextHolder}
      <Card style={{ width: "100%" }}>
        {Profile.wishlist_name === null ? (
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            styles={{ image: { height: 60 } }}
            description={
              <Typography.Text style={{ color: "white", fontWeight: "bold" }}>
                You have no wishlists
              </Typography.Text>
            }
          >
            <Button type="primary" onClick={() => setOpen(true)}>
              Create your wishlist!
            </Button>

            <Modal
              title="Create Your Wishlist"
              open={open}
              onCancel={() => setOpen(false)}
              footer={null}
            >
              <Form
                name="wishlist-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                autoComplete="off"
              >
                <Form.Item
                  label="Wishlist Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "You must have a wishlist name to submit",
                    },
                  ]}
                >
                  <Input
                    value={wishname}
                    onChange={(e) => setWishName(e.target.value)}
                    placeholder="enter a name here"
                  />
                </Form.Item>

                <Form.Item label={null}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      float: "right",
                    }}
                    onClick={async () => {
                      await handleCreate(wishname);
                      setOpen(false);
                    }}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </Empty>
        ) : (
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <h2 style={{ margin: 0, textAlign: "center", flex: 1 }}>
                {Profile.wishlist_name}
              </h2>
              <DeleteOutlined
                style={{ fontSize: "20px", cursor: "pointer" }}
                onClick={() => setDeleteModal(true)}
              />
            </div>

            {userGames ? (
              <>
                <Modal
                  open={deleteModal}
                  title="Wishlist deletion"
                  onCancel={() => setDeleteModal(false)}
                  footer={
                    <Button
                      onClick={handleWishlistDeletion}
                      style={{ backgroundColor: "red", color: "white" }}
                    >
                      Delete
                    </Button>
                  }
                >
                  <h4>
                    You are about to delete your wishlist which has{" "}
                    {userGames.length} games in it, are you sure?
                  </h4>
                  <br />
                  <h5>
                    This action cannot be reversed, however you can make a new
                    wishlist any time!
                  </h5>
                </Modal>

                <List
                  itemLayout="horizontal"
                  dataSource={userGames}
                  pagination={{ pageSize: 2 }}
                  renderItem={(item: Game) => (
                    <List.Item
                      className="list"
                      onClick={() => openGameModal(item)}
                    >
                      <List.Item.Meta
                        title={item.name ?? item.title}
                        description={<h4>Release date: {item.released}</h4>}
                      />
                      {item.game_image ? (
                        <img
                          src={item.game_image}
                          alt={item.name ?? item.title ?? "Game"}
                          style={{
                            height: "100px",
                            width: "100px",
                            margin: "5px",
                          }}
                        />
                      ) : null}
                    </List.Item>
                  )}
                />

                <Modal
                  open={infoModal}
                  title={<h2>{displayName}</h2>}
                  onCancel={closeGameModal}
                  footer={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <DeleteOutlined
                        style={{
                          color: "red",
                          fontSize: "20px",
                          cursor: "pointer",
                        }}
                        onClick={async () => {
                          closeGameModal();
                          showNotification(
                            "success",
                            displayName,
                            "removed game from wishlist"
                          );
                          await handleRemove(displayName);
                        }}
                      />
                      <Button onClick={closeGameModal}>Close</Button>
                    </div>
                  }
                >
                  {selectedGame?.game_image ? (
                    <img
                      src={selectedGame.game_image}
                      alt={displayName}
                      style={{
                        height: "200px",
                        width: "200px",
                        margin: "5px",
                      }}
                    />
                  ) : null}

                  <h4
                    style={{
                      fontSize: "16px",
                      color: "#333",
                      margin: "12px 0",
                      padding: "10px 16px",
                      background:
                        "linear-gradient(135deg, #ff6b3515, #f7258515)",
                      borderRadius: "8px",
                      borderLeft: "4px solid #f72585",
                      fontWeight: "600",
                    }}
                  >
                    📅 Release date:{" "}
                    <span style={{ fontWeight: "bold", color: "#f72585" }}>
                      {selectedGame?.released}
                    </span>
                  </h4>

                  <h4
                    style={{
                      fontSize: "15px",
                      color: "#444",
                      lineHeight: "1.6",
                      margin: "12px 0",
                      padding: "14px 16px",
                      background:
                        "linear-gradient(135deg, #7209b715, #4cc9f015)",
                      borderRadius: "8px",
                      borderLeft: "4px solid #7209b7",
                      fontWeight: "normal",
                    }}
                  >
                    📖 <strong>Summary:</strong> {selectedGame?.description}
                  </h4>

                  <h3
                    style={{
                      fontSize: "16px",
                      color: "#333",
                      margin: "12px 0",
                      padding: "10px 16px",
                      background:
                        "linear-gradient(135deg, #4cc9f015, #06ffa515)",
                      borderRadius: "8px",
                      borderLeft: "4px solid #4cc9f0",
                      fontWeight: "600",
                    }}
                  >
                    🎮 Platforms:{" "}
                    <span style={{ fontWeight: "bold", color: "#4cc9f0" }}>
                      {Array.isArray(selectedGame?.platform)
                        ? selectedGame?.platform.join(", ")
                        : selectedGame?.platform}
                    </span>
                  </h3>
                </Modal>
              </>
            ) : null}

            <Button className="Button" onClick={() => setGameModal(true)}>
              Add some games
            </Button>

            <Modal
              title="Search for a game"
              open={gameModal}
              onCancel={() => setGameModal(false)}
              destroyOnHidden
              footer={
                <Button
                  onClick={async () => {
                    await handleAdd(games);
                    setGameModal(false);
                    await handleShow();
                  }}
                  style={{ backgroundColor: "green", color: "white" }}
                >
                  Add Game
                </Button>
              }
            >
              <GamesDisplay setGames={setGames} />
            </Modal>
          </Card>
        )}
      </Card>
    </>
  );
};

export default Wishlist;
