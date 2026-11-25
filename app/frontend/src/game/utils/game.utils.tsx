import { useNavigate } from "react-router";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import {
  BuildingType,
  MAGIC_DICE_INFO,
  MAGIC_DICE_RULES,
  MAGIC_DICE_TITLE,
  MagicDiceRule,
  Phase,
  ResourceType,
  SettingsDataSchema,
  type SettingsData,
} from "shared";
import { z } from "zod";
import { http } from "../../services/http.tsx";
import { Title, Text } from "@mantine/core";

export function DisplayMagicDiceRules() {
  return (
    <Text style={{ whiteSpace: "pre-line" }}>
      <Title order={4}>{MAGIC_DICE_TITLE}</Title>
      {MAGIC_DICE_INFO}
      <Title order={6}>Magic Dice Effects</Title>
      {`• ${MAGIC_DICE_RULES[MagicDiceRule.EXTRA_RESOURCES]} for everybody\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.RESOURCES_CRISIS]} for everybody\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.WEALTHY_LANDLORD]} for the roller\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.POOR_LANDLORD]} for the roller\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.ALL_BLESSED]} for everybody\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.BLESSED_ONE]} for the roller\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.CURSED_ONE]} for the roller\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.SALES]} for everybody\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.INFLATION]} for everybody\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.FREEZE_THEM]} except the roller\n` +
        `• ${MAGIC_DICE_RULES[MagicDiceRule.FREEZE_ME]}\n`}
    </Text>
  );
}

export function DisplaySetting({
  gameId,
  settings,
}: {
  gameId: string;
  settings: SettingsData;
}) {
  return (
    <Text style={{ whiteSpace: "pre-line" }}>
      <Title order={4}>Current Game Settings</Title>
      {`• Party code: ${gameId}\n` +
        `• Gameboard layout: ${settings.gameboardLayout}\n`}
      <Title order={6}>Time & Actions limits</Title>
      {`• Time per player turn: ${settings.turnDurationSeconds}\n` +
        `• Trade limit during « ${Phase.TRADE_BUILD} »: ${settings.tradeLimit}\n` +
        `• Build limit during « ${Phase.TRADE_BUILD} »: ${settings.buildLimit}\n`}
      <Title order={6}>Trading Rates</Title>
      {`• Specialized Port rate: ${settings.specialPortOfferRate}\n` +
        `• Generic Port rate: ${settings.genericPortOfferRate}\n` +
        `• Reserve rate: ${settings.reserveOfferRate}\n`}
      <Title order={6}>Points Earned</Title>
      {`• Point(s) per ${BuildingType.ROAD}: ${settings.roadPoints}\n` +
        `• Point(s) per ${BuildingType.SETTLEMENT}: ${settings.settlementPoints}\n` +
        `• Point(s) per ${BuildingType.CITY}: ${settings.cityPoints}\n` +
        `• Points to win: ${settings.pointsToWin}\n`}
      <Title order={6}>Magic Dice</Title>
      {`• Magic Dice enabled: ${settings.magicDiceEnabled}\n` +
        `• Time to roll Magic Dice: ${settings.magicDiceDurationSeconds}\n`}
      <Title order={6}>Bonus</Title>
      {`• Robber threshold: ${settings.robberThreshold}\n` +
        `• Resources multiplier: ${settings.resourcesMultiplier}\n` +
        `• ${ResourceType.WOOD} bonus: ${settings.woodBonus}\n` +
        `• ${ResourceType.SHEEP} bonus: ${settings.sheepBonus}\n` +
        `• ${ResourceType.BRICK} bonus: ${settings.brickBonus}\n` +
        `• ${ResourceType.ORE} bonus: ${settings.oreBonus}\n` +
        `• ${ResourceType.WHEAT} bonus: ${settings.wheatBonus}\n`}
    </Text>
  );
}

export function useCreateLobby() {
  const navigate = useNavigate();

  return async function createLobby(values: SettingsData) {
    const parsed = SettingsDataSchema.safeParse(values);
    if (!parsed.success) {
      console.error("Invalid settings:", z.treeifyError(parsed.error));
      return;
    }
    try {
      await http.post("/game/create", parsed.data);
      navigate("/game");
      console.log("Game created succesfully");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/");
        return;
      }
      console.log("User already in a game");
      navigate("/game");
      return;
    }
  };
}

export function useJoinLobby() {
  const navigate = useNavigate();

  return async function joinLobby(gameId: string) {
    try {
      await http.post("/game/join", { gameId });
      navigate("/game");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/");
        return;
      } else if (axios.isAxiosError(error) && error.response?.status === 409) {
        navigate("/game");
        return;
      } else {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        notifications.show({
          title: "Could not join the game",
          message:
            typeof message === "string" ? message : "Please try again later.",
          color: "red",
        });
      }
    }
  };
}
