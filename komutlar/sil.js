const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sil')
    .setDescription('Belirtilen sayı kadar mesajı siler.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option.setName('sayı')
        .setDescription('Silinecek mesaj sayısı (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const miktar = interaction.options.getInteger('sayı');

    if (!interaction.channel || !interaction.channel.isTextBased()) {
      return interaction.reply({ content: 'Bu komut sadece metin kanallarında kullanılabilir.', ephemeral: true });
    }

    try {
      const silinen = await interaction.channel.bulkDelete(miktar, true);

      await interaction.reply({ content: `✅ Başarıyla ${silinen.size} mesaj silindi.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Mesajlar silinirken bir hata oluştu.', ephemeral: true });
    }
  }
};
