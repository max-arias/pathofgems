import React from "/web_modules/react.js";
import styled from "/web_modules/styled-components.js";
const Avatar = styled.div`
  background: url('/lib/images/inventory-sprite.png') no-repeat;
  width: 110px;
  height: 80px;

  &.Marauder {
    background-position: -220px -420px;
  }

  &.Juggernaut {
    background-position: -548px 0px;
  }

  &.Berserker {
    background-position: -110px -260px;
  }

  &.Chieftain {
    background-position: -438px -80px;
  }

  &.Shadow {
    background-position: 0px -260px;
  }

  &.Assassin {
    background-position: -328px -80px;
  }

  &.Saboteur {
    background-position: 0px -340px;
  }

  &.Trickster {
    background-position: -110px -180px;
  }

  &.Witch {
    background-position: -438px -160px;
  }

  &.Occultist {
    background-position: -438px -320px;
  }

  &.Elementalist {
    background-position: -548px -160px;
  }

  &.Necromancer {
    background-position: -110px -420px;
  }

  &.Templar {
    background-position: -328px 0px;
  }

  &.Inquisitor {
    background-position: -548px -80px;
  }

  &.Hierophant {
    background-position: -548px -240px;
  }

  &.Guardian {
    background-position: -548px -320px;
  }

  &.Duelist {
    background-position: -330px -420px;
  }

  &.Slayer {
    background-position: -328px -160px;
  }

  &.Gladiator {
    background-position: -548px -400px;
  }

  &.Champion {
    background-position: -110px -340px;
  }

  &.Ranger {
    background-position: -220px -340px;
  }

  &.Deadeye {
    background-position: 0px -420px;
  }

  &.Raider {
    background-position: -438px 0px;
  }

  &.Pathfinder {
    background-position: -438px -240px;
  }

  &.Scion {
    background-position: -220px -260px;
  }

  &.Ascendant {
    background-position: 0px -180px;
  }
`;
export default (({
  buildClass
}) => React.createElement(Avatar, {
  className: buildClass
}));