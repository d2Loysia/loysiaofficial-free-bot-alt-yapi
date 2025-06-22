const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('captcha')
    .setDescription('Doğrulama sistemi kurulumu yapar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Doğrulama mesajının gönderileceği kanal')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Doğrulama sonrası verilecek rol')
        .setRequired(true)),

  async execute(interaction) {
    const kanal = interaction.options.getChannel('kanal');
    const rol = interaction.options.getRole('rol');
    const db = interaction.client.db;

    db.run(`
      INSERT INTO captcha_settings (guildId, channelId, roleId)
      VALUES (?, ?, ?)
      ON CONFLICT(guildId) DO UPDATE SET channelId = excluded.channelId, roleId = excluded.roleId
    `, [interaction.guild.id, kanal.id, rol.id], async (err) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Veritabanı hatası oluştu.', ephemeral: true });
      }

      const button = new ButtonBuilder()
        .setCustomId('verify')
        .setLabel('✅ Hesabımı Doğrula')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setTitle('🔐 Doğrulama Sistemi')
        .setDescription('Sunucuya Hoş Geldiniz!\n\nHesabınızı onaylamak için aşağıdaki butona tıklayınız.')
        .setColor('Green');

      await kanal.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ Doğrulama mesajı ${kanal} kanalına gönderildi.`, ephemeral: true });
    });
  }
};
