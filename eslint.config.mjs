import nextConfig from "eslint-config-next"

const config = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default config
