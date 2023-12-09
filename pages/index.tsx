// Import statements (keep your existing imports)
import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect, useMemo } from "react";

import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Leaderboard from "@/components/Leaderboard";
import { getLeaderboard, LeaderboardItem } from "@/lib/clicker-anchor-client";

import {
  airdrop,
  getCurrentGame,
  saveClick,
} from "../lib/clicker-anchor-client";
import ExternalLink from "@/components/ExternalLink";

const Home: NextPage = () => {
  // Updated color values with gradients
  const backgroundGradient = 'linear-gradient(to right, #FFD3B5, #FD6585)'; // Gradient from Apricot to Wild Watermelon
  const navbarGradient = 'linear-gradient(to right, #36D1DC, #5B86E5)'; // Gradient from Dodger Blue to Light Slate Gray
  const buttonGradient = 'linear-gradient(to right, #FF6B6B, #FFD166)'; // Gradient from Melon to Pastel Yellow
  const buttonHoverGradient = 'linear-gradient(to right, #FF8C8C, #FFEA8C)'; // Gradient from Light Salmon to Pastel Yellow
  const leaderboardGradient = 'linear-gradient(to right, #74ebd5, #ACB6E5)'; // Gradient from Light Green to Lavender


  const [clicks, setClicks] = useState(0);
  const [effect, setEffect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [solanaExplorerLink, setSolanaExplorerLink] = useState("");
  const [gameError, setGameError] = useState("");
  const [gameAccountPublicKey, setGameAccountPublicKey] = useState("");
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);

  const { connected } = useWallet();
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallet = useAnchorWallet();

  async function handleClick() {
    setGameError("");
    if (wallet) {
      try {
        await saveClick({ wallet, endpoint, gameAccountPublicKey });
        setClicks(clicks + 1);
        setEffect(true);
      } catch (e) {
        if (e instanceof Error) {
          setGameError(e.message);
        }
      }
    }
  }

  useEffect(() => {
    async function initGame() {
      if (wallet) {
        const gameState = await getCurrentGame({ wallet, endpoint });
        setIsGameReady(connected && gameState.isReady);
        setClicks(gameState.clicks);
        setGameAccountPublicKey(gameState.gameAccountPublicKey);
        setSolanaExplorerLink(
          `https://explorer.solana.com/address/${gameAccountPublicKey}/anchor-account?cluster=${network}`
        );
        setGameError(gameState.errorMessage);
      } else {
        setIsGameReady(false);
        setClicks(0);
        setGameAccountPublicKey("");
        setSolanaExplorerLink("");
        setGameError("");
      }
    }
    setIsConnected(connected);
    initGame();
  }, [connected, endpoint, network, wallet, gameAccountPublicKey]);

  useEffect(() => {
    async function fetchTestSol(): Promise<void> {
      if (wallet) {
        try {
          await airdrop({ wallet, endpoint });
        } catch (e) {
          if (e instanceof Error) {
            console.error(`Unable to airdrop 1 test SOL due to ${e.message}`);
          }
        }
      }
    }
    fetchTestSol();
  }, [connected, wallet, endpoint]);

  useEffect(() => {
    (async function getLeaderboardData() {
      if (wallet) {
        setLeaders(await getLeaderboard({ wallet, endpoint }));
      }
    })();
  }, [wallet, endpoint]);

  return (
    <div className="flex items-center flex-col sm:p-4 p-1" style={{ background: backgroundGradient }}>
      <Head>
        <title>AO CLICK</title>
        <meta name="title" content="AO CLICK" />
        <meta name="description" content="AO CLICK is an open-source game being developed to learn and demonstrate techniques for integrating with Solana programs and Solana NFTs." />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="AO CLICK" />
        <meta property="og:url" content="https://solana-clicker.netlify.app/" />
        <meta property="og:image" content="https://solana-clicker.netlify.app/home.png" />
        <meta property="og:description" content="AO CLICK is an open-source game being developed to learn and demonstrate techniques for integrating with Solana programs and Solana NFTs." />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="AO CLICK" />
        <meta name="twitter:description" content="AO CLICK is an open-source game being developed to learn and demonstrate techniques for integrating with Solana programs and Solana NFTs." />
        <meta name="twitter:image" content="https://solana-clicker.netlify.app/home.png" />
      </Head>

      <div className="navbar mb-2 text-base-content rounded-full sm:p-4" style={{ background: navbarGradient }}>
        <div className="flex-1 text-xl font-mono">
          <img src="/logo.jpg" alt="Logo" className="h-14 w-14 rounded-40px" />
        </div>
        <div>
          <WalletMultiButton />
        </div>
        <div className="badge badge-accent badge-outline flex-none XXXml-2">
          <a href="#devnet">devnet</a>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="p-4 flex flex-col items-center gap-3">
            <div className="flex flex-col items-center p-2">
              {isGameReady && gameError && (
                <div className="alert alert-error shadow-lg" style={{ background: buttonGradient }}>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current flex-shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span style={{ color: 'white' }}>{gameError}</span>
                  </div>
                </div>
              )}
              {isGameReady && (
                <div
                  onAnimationEnd={() => {
                    setEffect(false);
                  }}
                  className={`${effect && "animate-wiggle"}`}
                  style={{ color: 'white' }}
                >
                  {clicks} clicks
                </div>
              )}
            </div>
            <button
              disabled={!isGameReady}
              onClick={() => {
                handleClick();
              }}
              className="btn btn-lg text-white border-4 h-36 w-36 rounded-full transform transition-transform hover:scale-105"
              style={{
                background: buttonGradient,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span
                className="absolute top-0 left-0 w-full h-full bg-white opacity-20"
                style={{
                  transition: 'background 0.3s ease-out',
                  background: buttonHoverGradient,
                }}
              ></span>
              Click Me
            </button>

            {isGameReady && (
              <div>
                View game{" "}
                <a
                  className="underline"
                  href={solanaExplorerLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: buttonGradient }}
                >
                  details
                </a>{" "}
                on Solana.
              </div>
            )}

            {!isConnected && (
              <div>
                <WalletMultiButton />
              </div>
            )}

            {!isGameReady && isConnected && (
              <div>
                <p className="p-2">Game initializing...</p>
              </div>
            )}
          </div>

          {wallet && (
            <Leaderboard
              leaders={leaders}
              walletPublicKeyString={wallet.publicKey.toBase58()}
              clicks={clicks}
              backgroundGradient={leaderboardGradient}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
