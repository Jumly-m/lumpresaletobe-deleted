import Dashboard from "./components/Dashboard";
import LumDashboard from "./components/LumDashboard"
import "./assets/sass/index.scss";
import NavbarComp from "./components/NavbarComp";
import { WagmiConfig } from "wagmi";
import { ethereumClient, projectId, wagmiConfig } from "./utils/web3-utils";
import { Web3Modal } from "@web3modal/react";
import Footer from "./components/footer";
import Pool from "./components/pools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./components/NotFound";
import Presale from "./components/Presale";


function App() {
  return (
    <BrowserRouter basename="/">
    <>
    
      <div className="main-container">
        <WagmiConfig config={wagmiConfig}>
          <div className="navbar-container">
            <NavbarComp />
          </div>
          <Routes>
            <Route path="/" element={<Pool />} />
            <Route path="/dashboard" element={< Dashboard/>} />
            <Route path="/lum-staking" element={< LumDashboard/>}/>
            <Route path="/presale" element={<Presale/>}/>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </div>
      </>
    </BrowserRouter>
  );
}

export default App;
