const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yardım')
    .setDescription('Komut kategorilerini gösterir'),

  async execute(interaction) {
    const kategoriler = {
      Genel: [
        '`/level` - Seviyeni gösterir',
      ],
      Moderasyon: [
        '`/kick` - Kullanıcıyı atar.',
        '`/ban` - Kullanıcıyı yasaklar.',
        '`/unban` - Kullanıcının yasağını kaldırır.',
        '`/mute` - Kullanıcıyı susturur.',
        '`/unmute` - Kullanıcının susturmasını kaldırır.',
        '`/kilit` - Kanalı kilitler veya açar.',
        '`/yavaş-mod` - Yavaş mod süresi ayarlanır.',
        '`/tepki-rol` - Emojiye tıklayanlara rol verir.',
        '`/rol-ver/al` - Rol verir veya alır.',
        '`/hg-bb` - Karşılama ve Veda mesajı kanalı ayarla.',
        '`/captcha` - Doğrulama sistemi kurulumu yapar.',
        '`/komut-oluştur` - Kendi özel komutunu oluştur.',
        '`/sil` - Belirtilen sayı kadar mesaj siler.',
      ]
    };

    const mainEmbed = new EmbedBuilder()
      .setTitle('📘 Yardım Menüsü')
      .setDescription('Lütfen aşağıdaki kategorilerden birini seçin:')
      .setColor('Blue');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('Genel').setLabel('Genel').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('Moderasyon').setLabel('Moderasyon').setStyle(ButtonStyle.Danger)
    );

    const reply = await interaction.reply({
      embeds: [mainEmbed],
      components: [row],
      flags: 64, // ephemeral: true yerine kullanılır (deprecated uyarısını engeller)
      fetchReply: true
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Bu menüyü sadece komutu kullanan kişi kullanabilir.', flags: 64 });
      }

      const kategori = i.customId;
      const komutlar = kategoriler[kategori];

      if (!komutlar) {
        return i.reply({ content: '⚠️ Bu kategoriye ait komutlar tanımlanmamış.', flags: 64 });
      }

      const embed = new EmbedBuilder()
        .setTitle(`📂 ${kategori} Komutları`)
        .setDescription(komutlar.join('\n'))
        .setColor('Green');

      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', async () => {
      await reply.delete().catch(() => {});
    });
  }
};
