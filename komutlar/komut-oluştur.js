const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('komut-oluştur')
    .setDescription('Kendi özel komutunu oluştur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // sadece yönetici

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('komut_olustur')
      .setTitle('📌 Komut Oluştur');

    const triggerInput = new TextInputBuilder()
      .setCustomId('tetikleyici')
      .setLabel('Komutu tetikleyecek kelime (örn: !bilgi)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const messageInput = new TextInputBuilder()
      .setCustomId('yanit')
      .setLabel('Komut yanıtı (ne söylesin?)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(triggerInput);
    const row2 = new ActionRowBuilder().addComponents(messageInput);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
  },
};
