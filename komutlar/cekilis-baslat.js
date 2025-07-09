const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const cekilisler = new Map(); // Sunucu bazlı aktif çekilişleri tutar (memory)

module.exports = {
  data: new SlashCommandBuilder()
    .setName('çekiliş-başlat')
    .setDescription('Yeni bir çekiliş başlatır')
    .addStringOption(option => 
      option.setName('mesaj')
        .setDescription('Çekiliş açıklaması/metni')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('sure')
        .setDescription('Çekiliş süresi (dakika cinsinden)')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('kazanan_sayisi')
        .setDescription('Kaç kişi kazanacak?')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'Bu komutu sadece yönetici kullanabilir.', ephemeral: true });
    }

    const mesaj = interaction.options.getString('mesaj');
    const sure = interaction.options.getInteger('sure');
    const kazananSayisi = interaction.options.getInteger('kazanan_sayisi');
    if (sure <= 0 || kazananSayisi <= 0) {
      return interaction.reply({ content: 'Süre ve kazanan sayısı 0 dan büyük olmalı.', ephemeral: true });
    }

    const bitisZamani = Math.floor(Date.now() / 1000) + sure * 60; // Unix timestamp (saniye)

    // Embed oluştur
    const embed = new EmbedBuilder()
      .setTitle('🎉 Yeni Çekiliş Başladı! 🎉')
      .setDescription(mesaj)
      .addFields(
        { name: 'Kazanan Sayısı', value: `${kazananSayisi}`, inline: true },
        { name: 'Kalan Süre', value: `<t:${bitisZamani}:R>`, inline: true },
        { name: 'Katılanlar', value: '0 kişi', inline: true },
      )
      .setColor('Green')
      .setFooter({ text: `Başlatan: ${interaction.user.tag}` })
      .setTimestamp();

    // Butonlar
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('cekilis_katil')
          .setLabel('🎉 Katıl')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cekilis_reroll')
          .setLabel('🔄 Yeniden Çek')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true), // Başta pasif
        new ButtonBuilder()
          .setCustomId('cekilis_iptal')
          .setLabel('❌ İptal Et')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true), // Başta pasif
      );

    const mesajSent = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    // Çekiliş data'sını sakla
    cekilisler.set(mesajSent.id, {
      channelId: interaction.channel.id,
      messageId: mesajSent.id,
      guildId: interaction.guild.id,
      mesaj,
      sure,
      kazananSayisi,
      bitisZamani,
      katilanlar: new Set(),
      aktif: true,
      baslatan: interaction.user.id,
    });

    // Süre sonunda çekilişi bitir
    // Süre sonunda çekilişi bitir
setTimeout(async () => {
  const cekilis = cekilisler.get(mesajSent.id);
  if (!cekilis || !cekilis.aktif) return;

  cekilis.aktif = false;

  const channel = interaction.guild.channels.cache.get(cekilis.channelId);
  if (!channel) return;

  const msg = await channel.messages.fetch(cekilis.messageId);
  if (!msg) return;

  // Kazananları seç
  const katilanArray = Array.from(cekilis.katilanlar);
  let kazananlar = [];
  if (katilanArray.length === 0) {
    kazananlar = ['Çekilişe kimse katılmadı.'];
  } else {
    while (kazananlar.length < cekilis.kazananSayisi && katilanArray.length > 0) {
      const secilen = katilanArray.splice(Math.floor(Math.random() * katilanArray.length), 1)[0];
      kazananlar.push(`<@${secilen}>`);
    }
  }

  // Embed güncelle
  const bitisEmbed = EmbedBuilder.from(msg.embeds[0])
    .setTitle('🎉 Çekiliş Bitti! 🎉')
    .setDescription(`**Kazananlar:**\n${kazananlar.join('\n')}`)
    .setColor('DarkGreen');

  // Butonları kaldır ve yenilerini koy (katıl kapandı, sadece yeniden çek & iptal aktif)
  const bitisRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('cekilis_reroll')
        .setLabel('🔄 Yeniden Çek')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId('cekilis_iptal')
        .setLabel('❌ İptal Et')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false),
    );

  await msg.edit({ embeds: [bitisEmbed], components: [bitisRow] });

  // Kazananları normal mesaj olarak kanala gönder
  await channel.send(`🎉 **Çekiliş Bitti! Kazananlar:**\n${kazananlar.join('\n')}`);

}, sure * 60 * 1000);

  },

  cekilisler,
};
