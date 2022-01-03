import React, { useState } from "react";

import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import { Message } from "../ui/Message";
import { InventoryItems } from "../ui/InventoryItems";

import {
  Context,
  BlockchainEvent,
  BlockchainState,
  service,
} from "../../machine";

import matic from "../../images/ui/matic.svg";
import icon from "../../images/ui/icon.png";
import carry from "../../images/characters/goblin_carry.gif";

import { recipes, Recipe, Inventory, Item } from "../../types/crafting";
import { Box, BoxProps } from "./Box";

import "./Crafting.css";
import { useService } from "@xstate/react";

interface Props {
  onClose: () => void;
  balance: number;
  recipe: Recipe;
}

export const CommunityApproval: React.FC<Props> = ({
  onClose,
  balance,
  recipe,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState("");
  const [machineState, send] = useService<
    Context,
    BlockchainEvent,
    BlockchainState
  >(service);
  const isUnsaved = machineState.context.blockChain.isUnsaved();

  const quickSwapRate = 2;
  const sunflowerTokens = recipe.ingredients[0].amount;
  const maticPrice = sunflowerTokens * quickSwapRate;

  const craft = () => {
    // service.send("CRAFT", {
    //   recipe: selectedRecipe,
    //   amount,
    // });
    onClose();
  };

  const approve = async () => {
    setIsApproving(true);
    setError("");

    try {
      await machineState.context.blockChain.approve("0x", 100);

      setIsApproved(true);
    } catch (e) {
      setError(`Unable to approve: ${e}`);
    } finally {
      setIsApproving(false);
    }
  };

  const sunflowerTokenAmount = recipe.ingredients[0].amount;

  return (
    <div id="crafting">
      <div id="community-left">
        <span className="community-guide-text">
          By crafting this item you will be sending $SFF and $MATIC into
          the Community QuickSwap pool.
        </span>
        <span className="community-guide-text">
          Please note that prices change frequently and the $SFF amount may
          have a slippage. By crafting you accept these conditions.
        </span>
        {!isApproved && (
          <div>
            <span className="community-guide-text">
              Step 1 - Approve $SFF
            </span>
            {!isApproving && <Button onClick={approve}>Approve</Button>}
            {isApproving && (
              <>
                <div id="approving-animation">
                  <img id="approving-goblin" src={carry} />
                  <img id="approving-sff" src={icon} />
                </div>
                <span className="community-guide-text">Approving...</span>
              </>
            )}
          </div>
        )}

        {isApproved && (
          <div>
            <span className="community-guide-text">Step 2 - Craft</span>
            <Button onClick={approve}>Craft</Button>
          </div>
        )}

        {error && <span id="community-error">{error}</span>}
      </div>
      <div id="recipe">
        <span className={`recipe-type recipe-nft`}>NFT</span>
        <span id="recipe-title">{recipe.name}</span>
        <div id="crafting-item">
          <img src={recipe.image} />
        </div>
        <span id="recipe-description">{recipe.description}</span>

        <div id="ingredients">
          <div className="ingredient">
            <div>
              <img
                className="ingredient-image"
                src={recipe.ingredients[0].image}
              />
              <span className="ingredient-count">$SFF</span>
            </div>
            <span className={`ingredient-text`}>
              {sunflowerTokenAmount}
            </span>
          </div>
          <div className="ingredient">
            <div>
              <img className="ingredient-image" src={matic} />
              <span className="ingredient-count">$MATIC</span>
            </div>
            <span className={`ingredient-text`}>{maticPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
