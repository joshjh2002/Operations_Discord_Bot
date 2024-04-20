export const colours = {
  default: 13724201,
  log: 3847248,
};

export const roles = {
  region_roles: {
    metadata: {
      name: "Region Roles",
      description:
        "Please choose a role base on the region you are joining us from. This helps other gamers identify the region you are playing in.",
      color: colours.default,
    },
    roles: {
      north_america: {
        role_id: "1047157742831423549",
        role_emoji: { name: "AMERICA", id: "1212487815645106227" },
      },
      europe: {
        role_id: "1047157818999963648",
        role_emoji: { name: "EUROPE", id: "1212487829163352094" },
      },
      asia: {
        role_id: "1047158446602063913",
        role_emoji: { name: "Flag_Asia", id: "1212487842069225524" },
      },
      south_america: {
        role_id: "1212018192516517958",
        role_emoji: { name: "BRAZIL", id: "1212488550852067348" },
      },
      oceania: {
        role_id: "1212018262452469820",
        role_emoji: { name: "Flag_Australia", id: "1212487867876507760" },
      },
      africa: {
        role_id: "1212018320359030794",
        role_emoji: { name: "Africa", id: "1212487855268560947" },
      },
    },
  },
  ping_roles: {
    metadata: {
      name: "Ping Roles",
      description:
        "Select which pings you would like to receive on the Discord server. Once you have this role you will get a notification if someone posts in their relevant channel(s).",
      color: colours.default,
    },
    roles: {
      freebies: {
        role_id: "1212017620996329563",
        role_emoji: { name: "freebies", id: "1212488930352697374" },
      },
      quotes: {
        role_id: "1212017750751580211",
        role_emoji: { name: "Quotes", id: "1212489010434416680" },
      },
      stream: {
        role_id: "1213955307521187921",
        role_emoji: { name: "stream", id: "1213955940898836532" },
      },
    },
  },
  cosmetic_roles: {
    metadata: {
      name: "Cosmetic Roles",
      description:
        "Please choose any of the following cosmetic roles that you would like. These roles do not come with permissions and are purely for aesthetic.",
      color: colours.default,
    },
    roles: {
      harvester: {
        role_id: "1047156960769867916",
        role_emoji: { name: "farmers_guild", id: "1212487752977743942" },
      },
      collector: {
        role_id: "1212043928279453767",
        role_emoji: { name: "Artifacts", id: "1212487763602178057" },
      },
      infantry: {
        role_id: "786593800596357130",
        role_emoji: { name: "military", id: "1212487721080332359" },
      },
      rustic_warriors: {
        role_id: "1212011591273283635",
        role_emoji: { name: "NewUI_Class_Warrior", id: "1212487708530835456" },
      },
      desert_rangers: {
        role_id: "1212010768002842685",
        role_emoji: { name: "Ranger", id: "1212487694538510398" },
      },
      warlord: {
        role_id: "1212020537098899467",
        role_emoji: { name: "war", id: "1212487737467473921" },
      },
      light_side: {
        role_id: "786591672770625548",
        role_emoji: { name: "resistance", id: "1212487677472145448" },
      },
      dark_side: {
        role_id: "917405625712001085",
        role_emoji: { name: "empire", id: "1212487662506610769" },
      },
    },
  },
};
