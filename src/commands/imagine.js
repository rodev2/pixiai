const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const { REPLICATE_API_KEY } = require('../../config.json');
const models = require('../models');

module.exports = {
  run: async ({ interaction }) => {
    try {
      await interaction.deferReply();

      const { default: Replicate } = await import('replicate');

      const replicate = new Replicate({
        auth: REPLICATE_API_KEY,
      });

      const prompt = interaction.options.getString('prompt');
      const model = interaction.options.getString('model') || models[0].value;

      const output = await replicate.run(model, { input: { prompt } });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(`Descargar`)
          .setStyle(ButtonStyle.Link)
          .setURL(`${output[0]}`)
          .setEmoji('1101133529607327764')
      );

      const resultEmbed = new EmbedBuilder()
        .setTitle('Imagen Generada')
        .addFields({ name: 'Prompt', value: prompt })
        .setImage(output[0])
        .setColor('#44a3e3')
        .setFooter({
          text: `Pedido por: ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      await interaction.editReply({
        embeds: [resultEmbed],
        components: [row],
      });
    } catch (error) {
      const errEmbed = new EmbedBuilder()
        .setTitle('Ocurrió un error!')
        .setDescription('```' + error + '```')
        .setColor(0xe32424);

      interaction.editReply({ embeds: [errEmbed] });
    }
  },

  data: {
    name: 'imagine',
    description: 'Genere una imagen usando un prompt.',
    options: [
      {
        name: 'prompt',
        description: 'Ingresa tu prompt',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'model',
        description: 'El modelo de imagen',
        type: ApplicationCommandOptionType.String,
        choices: models,
        required: false,
      },
    ],
  },
};
