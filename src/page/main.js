import React from "react";

import Input from "../components/input.js";

export default () => {
  return (
    <div
      className="grid lg:grid-cols-1_5_1 mt-24"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      <Input />
    </div>
  );
};
