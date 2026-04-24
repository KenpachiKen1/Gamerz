import { useState } from "react";
import { Avatar, Button } from "antd";

import cry from "../Profile_Pictures/cry.png";
import driver from "../Profile_Pictures/driver.png";
import electronic_brain from "../Profile_Pictures/electronic_brain.png";
import monk from "../Profile_Pictures/monk.png";
import mushroom from "../Profile_Pictures/mushroom.png";
import penguin from "../Profile_Pictures/penguin.png";
import roboTs from "../Profile_Pictures/roboTs.png";
import robot2 from "../Profile_Pictures/robot2.png";
import sunglasses from "../Profile_Pictures/sunglasses.png";
import robot from "../Profile_Pictures/robot.png";
import freeze from "../Profile_Pictures/freeze.png";
import goofy from "../Profile_Pictures/goofy.png";
import frieza from "../Profile_Pictures/frieza.png";
import hippo from "../Profile_Pictures/hippo.png";
import luckycat from "../Profile_Pictures/luckycat.png";
import sweaty from "../Profile_Pictures/sweaty.png";
import vr from "../Profile_Pictures/vr.png";
import alien from "../Profile_Pictures/alien.png";
import bee from "../Profile_Pictures/bee.png";
import Big_Frank from "../Profile_Pictures/Big_Frank.png";
import dracula from "../Profile_Pictures/dracula.png";
import FlyingMonster from "../Profile_Pictures/FlyingMonster.png";
import nerd from "../Profile_Pictures/Nerd.png";
import ninja from "../Profile_Pictures/Ninja.png";
import robot3 from "../Profile_Pictures/Robot3.png";
import scientist from "../Profile_Pictures/scientist.png";
import jason from "../Profile_Pictures/jason.png";
import witch from "../Profile_Pictures/witch.png";
import cupid from "../Profile_Pictures/cupid.png";
import eskimo from "../Profile_Pictures/eskimo.png";
import techno from "../Profile_Pictures/Techno.png";
import superhero from "../Profile_Pictures/superhero.png";
import dragon from "../Profile_Pictures/dragon.png";
import boy from "../Profile_Pictures/boy.png";
import girl from "../Profile_Pictures/girl.png";

type ProfilePicturesProps = {
  setPic: React.Dispatch<React.SetStateAction<string | null>>;
};

const profilePics: string[] = [
  boy,
  girl,
  cry,
  witch,
  jason,
  scientist,
  ninja,
  nerd,
  robot3,
  FlyingMonster,
  dracula,
  Big_Frank,
  alien,
  bee,
  vr,
  sweaty,
  luckycat,
  hippo,
  frieza,
  driver,
  freeze,
  goofy,
  electronic_brain,
  monk,
  mushroom,
  penguin,
  robot,
  roboTs,
  robot2,
  sunglasses,
  eskimo,
  cupid,
  superhero,
  dragon,
  techno,
];

function ProfilePictures({ setPic }: ProfilePicturesProps) {
  const [buttonIndex, setButtonIndex] = useState<number | null>(null);

  const handleClick = (pic: string, index: number) => {
    setButtonIndex((prevIndex) => (prevIndex === index ? null : index));
    setPic((prevPic) => (prevPic === pic ? null : pic));
  };

  return (
    <>
      <h2 style={{ textAlign: "center" }}>Choose a profile picture</h2>

      {profilePics.map((pic, index) => (
        <Button
          key={index}
          onClick={() => handleClick(pic, index)}
          style={{
            height: "55px",
            margin: "5px",
            backgroundColor: index === buttonIndex ? "#50C878" : "white",
            transition: "0.2s ease-in-out",
          }}
        >
          <Avatar src={pic} style={{ width: "50px", height: "50px" }} />
        </Button>
      ))}

      <div style={{ margin: "5px", width: "100%" }}>
        <h4 style={{ margin: "15px", textAlign: "center" }}>
          Thank you to{" "}
          <a href="https://www.flaticon.com/authors/yardeng">YardenG</a> and{" "}
          <a href="https://www.freepik.com">Freepik</a> for the pixel icons!
        </h4>
      </div>
    </>
  );
}

export default ProfilePictures;
