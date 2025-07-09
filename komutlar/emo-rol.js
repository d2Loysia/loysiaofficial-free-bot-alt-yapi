const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emo-rol')
    .setDescription('Belirtilen mesaj ID\'sine ✅ emojisi ekler ve tepki verenlere rol verir.')
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Verilecek rol')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mesaj-id')
        .setDescription('Emoji eklenecek mesaj ID\'si')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Bu komutu sadece yöneticiler kullanabilir.', ephemeral: true });
      }
  
    const rol = interaction.options.getRole('rol');
    const mesajId = interaction.options.getString('mesaj-id');

    const kanal = interaction.channel;

    try {
      const mesaj = await kanal.messages.fetch(mesajId);
      await mesaj.react('✅');

      interaction.reply({ content: '✅ Emoji eklendi. Reaksiyon alan kişilere rol verilecek.', ephemeral: true });

      const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;

      const collector = mesaj.createReactionCollector({ filter });

      collector.on('collect', async (reaction, user) => {
        const guildMember = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!guildMember) return;

        if (!guildMember.roles.cache.has(rol.id)) {
          await guildMember.roles.add(rol).catch(() => null);
        }
      });

    } catch (err) {
      console.error(err);
      interaction.reply({ content: 'Mesaj bulunamadı veya emoji eklenemedi.', ephemeral: true });
    }
  },
};
