import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import UserCards from './components/UserCards';
import Profile from './components/Profile';
import Wishlist from './components/Wishlist';
import CardPage from './components/CardPage';
import GlobalCardsPage from './components/GlobalCardsPage';
import GlobalSearchPage from './components/GlobalSearchPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cards/unique" element={<GlobalCardsPage type="unique" />} />
        <Route path="/cards/ultimate" element={<GlobalCardsPage type="ultimate" />} />
        <Route path="/cards/search" element={<GlobalSearchPage />} />
        <Route path="/user/:userId/profile" element={<Profile />} />
        <Route path="/user/:userId/cards" element={<UserCards />} />
        <Route path="/user/:userId/wishlist" element={<Wishlist />} />
        <Route path="/user/:userId" element={<Profile />} />
        <Route path="/card/:cardId" element={<CardPage />} />
      </Routes>
    </Layout>
  );
}
