import React from "react";
import Head from "next/head";

function MainPageHead() {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Quizzify</title>
      <meta name="og:title" content="Quizzify" />
      <link rel="icon" href="/lightBrain.svg" sizes="any" />
      <meta name="og:description" content="quizzify - @fabiangzvo" />
      <meta name="description" content="quizzify - @fabiangzvo" />
      <meta name="og:keywords" content="quiz, quizzes, quizzify" />
    </Head>
  );
}

export default MainPageHead;
