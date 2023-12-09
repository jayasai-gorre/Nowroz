import { useState, useEffect } from "react";
import { LeaderboardItem } from "@/lib/clicker-anchor-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  leaders: LeaderboardItem[];
  walletPublicKeyString: string;
  clicks: number;
  backgroundGradient: string;
};

const initialDisplayCount = 50;

export default function Leaderboard({
  leaders,
  walletPublicKeyString,
  clicks,
}: Props) {
  const [displayLeaders, setDisplayLeaders] = useState<LeaderboardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(initialDisplayCount);

  useEffect(() => {
    let foundCurrentUser = false;
    const updatedLeaders = leaders.map((leader) => {
      if (leader.playerPublicKey === walletPublicKeyString) {
        foundCurrentUser = true;
        return {
          playerPublicKey: leader.playerPublicKey,
          clicks: clicks,
        };
      }
      return leader;
    });

    if (walletPublicKeyString && clicks && !foundCurrentUser) {
      updatedLeaders.push({
        playerPublicKey: walletPublicKeyString,
        clicks: clicks,
      });
    }

    const sortByClicks = updatedLeaders.sort((a, b) => b.clicks - a.clicks);
    setDisplayLeaders(sortByClicks.slice(0, displayCount));
  }, [clicks, walletPublicKeyString, leaders, displayCount]);

  const handleSearch = () => {
    if (searchTerm === "") {
      setDisplayLeaders([...leaders.slice(0, displayCount)]);
    } else {
      const filteredLeaders = leaders.filter((leader) =>
        leader.playerPublicKey.includes(searchTerm)
      );
      setDisplayLeaders(filteredLeaders.slice(0, displayCount));
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + initialDisplayCount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify("Wallet address copied!");
  };

  const downloadWalletAddresses = () => {
    const filteredAddresses = leaders
      .filter((leader) => leader.clicks >= 100)
      .map((leader) => leader.playerPublicKey);

    const jsonContent = JSON.stringify(filteredAddresses, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallet_addresses.json";
    a.click();
    URL.revokeObjectURL(url);

    notify("Wallet addresses downloaded!");
  };

  const notify = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  return (
    <div className="sm:p-10 items-center flex flex-col">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search by Wallet Address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-l-md p-2 focus:outline-none focus:ring focus:border-blue-300 transition-all duration-300"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white rounded-r-md p-2 ml-1 transition-all duration-300 transform hover:scale-105"
        >
          Search
        </button>
      </div>
      <div className="text-2xl mb-4">
        Leaderboard
      </div>
      <div className="overflow-x-auto">
        <table
          className="table table-zebra w-full leaderboard-table"
        >
          <thead>
            <tr>
              <th className="text-center">
                Rank
              </th>
              <th className="text-center">
                Player
              </th>
              <th className="text-center">
                Total Clicks
              </th>
            </tr>
          </thead>
          <tbody>
            {displayLeaders.map((leader, index) => (
              <tr
                key={leader.playerPublicKey}
                className="leaderboard-row"
              >
                <th className="text-center">
                  {index + 1}
                </th>
                <td
                  className="text-center"
                  onClick={() => copyToClipboard(leader.playerPublicKey)}
                  style={{ cursor: "pointer" }}
                >
                  {leader.playerPublicKey === walletPublicKeyString ? (
                    <b>You</b>
                  ) : (
                    <span>{leader.playerPublicKey}</span>
                  )}
                </td>
                <td className="text-center">
                  {leader.clicks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {walletPublicKeyString === "ExnV1bFPfDQJ5PtVy8jEdH2gt19cu1XLDM8t7wprKdR5" && (
        <button
          onClick={downloadWalletAddresses}
          className="bg-green-500 text-white rounded-md p-2 mt-4"
        >
          Download Wallet Addresses (5+ clicks)
        </button>
      )}
      {leaders.length > displayCount && (
        <button
          onClick={handleLoadMore}
          className="bg-blue-500 text-white rounded-md p-2 mt-4"
        >
          Load More
        </button>
      )}
    </div>
  );
}
