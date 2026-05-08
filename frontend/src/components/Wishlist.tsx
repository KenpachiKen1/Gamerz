import { useEffect, useState } from "react";
import { Button, Form, List, Empty, Typography, Modal, Input } from "antd";
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

  const [open, setOpen] = useState(false);
  const [wishname, setWishName] = useState("");
  const [games, setGames] = useState<string | null>(null);
  const [gameModal, setGameModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

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

  const handleRemove = async (game: string) => {
    await remove_from_wishlist(game);
    await show_wishlist();
    await onChanged?.();
  };

  const handleWishlistDeletion = async () => {
    setDeleteModal(false);
    await delete_wishlist();
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

  const displayName = selectedGame?.name ?? selectedGame?.title ?? "Unknown";

  return (
    <>
      {contextHolder}

      <div className="wishlist-inner">
        {Profile.wishlist_name === null ? (
          <div className="wishlist-empty">
            <Empty
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              styles={{ image: { height: 60 } }}
              description={
                <Typography.Text className="wishlist-empty-text">
                  You have no wishlists
                </Typography.Text>
              }
            >
              <Button
                className="btn-create-wishlist"
                onClick={() => setOpen(true)}
              >
                Create your wishlist!
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            <div className="wishlist-header">
              <h2>{Profile.wishlist_name}</h2>
              <DeleteOutlined
                className="wishlist-delete-icon"
                onClick={() => setDeleteModal(true)}
              />
            </div>

            {userGames && userGames.length > 0 ? (
              <div className="wishlist-scroll">
                <List
                  itemLayout="horizontal"
                  dataSource={userGames}
                  pagination={{ pageSize: 2 }}
                  renderItem={(item: Game) => (
                    <List.Item
                      className="wishlist-list-item"
                      onClick={() => openGameModal(item)}
                    >
                      <List.Item.Meta
                        title={item.name ?? item.title}
                        description={`Release date: ${
                          item.released ?? "Unknown"
                        }`}
                      />

                      {item.game_image && (
                        <img
                          src={item.game_image}
                          alt={item.name ?? item.title ?? "Game"}
                          className="wishlist-game-thumb"
                        />
                      )}
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <p className="wishlist-no-games">No games added yet.</p>
            )}

            <Button
              className="btn-add-games"
              onClick={() => setGameModal(true)}
            >
              Add some games
            </Button>
          </>
        )}
      </div>

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
              placeholder="Enter a name here"
            />
          </Form.Item>

          <Form.Item label={null}>
            <Button
              type="primary"
              htmlType="submit"
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

      <Modal
        open={deleteModal}
        title="Wishlist deletion"
        onCancel={() => setDeleteModal(false)}
        footer={
          <Button danger type="primary" onClick={handleWishlistDeletion}>
            Delete
          </Button>
        }
      >
        <p>
          You are about to delete your wishlist which has{" "}
          {userGames?.length ?? 0} games in it. Are you sure?
        </p>
        <p>
          This action cannot be reversed, however you can make a new wishlist
          any time.
        </p>
      </Modal>

      <Modal
        open={infoModal}
        title={displayName}
        onCancel={closeGameModal}
        footer={
          <div className="wishlist-modal-footer">
            <DeleteOutlined
              className="wishlist-modal-delete"
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
        {selectedGame?.game_image && (
          <img
            src={selectedGame.game_image}
            alt={displayName}
            className="wishlist-modal-image"
          />
        )}

        <div className="game-detail-block release">
          <span className="game-detail-label">Release date</span>
          {selectedGame?.released ?? "Unknown"}
        </div>

        <div className="game-detail-block summary">
          <span className="game-detail-label">Summary</span>
          {selectedGame?.description ?? "No description available."}
        </div>

        <div className="game-detail-block platform">
          <span className="game-detail-label">Platforms</span>
          {Array.isArray(selectedGame?.platform)
            ? selectedGame?.platform.join(", ")
            : selectedGame?.platform ?? "Unknown"}
        </div>
      </Modal>

      <Modal
        title="Search for a game"
        open={gameModal}
        onCancel={() => setGameModal(false)}
        destroyOnHidden
        footer={
          <Button
            type="primary"
            onClick={async () => {
              await handleAdd(games);
              setGameModal(false);
            }}
          >
            Add Game
          </Button>
        }
      >
        <GamesDisplay setGames={setGames} />
      </Modal>
    </>
  );
};

export default Wishlist;
