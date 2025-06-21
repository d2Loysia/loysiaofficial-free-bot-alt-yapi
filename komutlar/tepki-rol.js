const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tepki-rol')
    .setDescription('Belirtilen mesaj ID\'sine ✅ emojisi ekler ve tepki verenlere rol verir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Verilecek rol')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mesaj-id')
        .setDescription('Emoji eklenecek mesaj ID\'si')
        .setRequired(true)),

  async execute(interaction) {
    const rol = interaction.options.getRole('rol');
    const mesajId = interaction.options.getString('mesaj-id');

    // Komutun kullanıldığı kanal
    const kanal = interaction.channel;

    try {
      const mesaj = await kanal.messages.fetch(mesajId);
      await mesaj.react('✅');

      await interaction.reply({ content: '✅ Emoji eklendi. Reaksiyon alan kişilere rol verilecek.', ephemeral: true });

      const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;

      const collector = mesaj.createReactionCollector({ filter, dispose: true });

      collector.on('collect', async (reaction, user) => {
        try {
          const guildMember = await interaction.guild.members.fetch(user.id);
          if (!guildMember.roles.cache.has(rol.id)) {
            await guildMember.roles.add(rol);
          }
        } catch (err) {
          console.error('Rol verirken hata:', err);
        }
      });

      // İstersen reaksiyon kaldırınca rolü de alabilirsin:
      collector.on('remove', async (reaction, user) => {
        try {
          const guildMember = await interaction.guild.members.fetch(user.id);
          if (guildMember.roles.cache.has(rol.id)) {
            await guildMember.roles.remove(rol);
          }
        } catch (err) {
          console.error('Rol alırken hata:', err);
        }
      });

    } catch (err) {
      console.error('Mesaj bulunamadı veya emoji eklenemedi:', err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Mesaj bulunamadı veya emoji eklenemedi.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Mesaj bulunamadı veya emoji eklenemedi.', ephemeral: true });
      }
    }
  },
};
