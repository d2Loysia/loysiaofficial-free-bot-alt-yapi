const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');
const { cekilisler } = require('../komutlar/cekilis-baslat');

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const cekilis = cekilisler.get(interaction.message.id);
  if (!cekilis) return;

  const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

  switch (interaction.customId) {
    case 'cekilis_katil': {
      if (!cekilis.aktif) {
        return interaction.reply({ content: '❌ Çekiliş sona erdi.', ephemeral: true });
      }

      if (cekilis.katilanlar.has(interaction.user.id)) {
        return interaction.reply({ content: '❗ Zaten çekilişe katıldınız.', ephemeral: true });
      }

      cekilis.katilanlar.add(interaction.user.id);

      const embed = EmbedBuilder.from(interaction.message.embeds[0]);
      const fields = embed.data.fields.map(f => {
        if (f.name === 'Katılanlar') {
          return { name: 'Katılanlar', value: `${cekilis.katilanlar.size} kişi`, inline: true };
        }
        return f;
      });

      await interaction.message.edit({ embeds: [embed.setFields(fields)] });

      return interaction.reply({ content: '🎉 Başarıyla çekilişe katıldınız!', ephemeral: true });
    }

    case 'cekilis_reroll': {
      if (!isAdmin) {
        return interaction.reply({ content: '❌ Bu işlemi sadece yöneticiler yapabilir.', ephemeral: true });
      }

      if (cekilis.aktif) {
        return interaction.reply({ content: '⌛ Çekiliş henüz bitmedi, yeniden çekemezsiniz.', ephemeral: true });
      }

      const katilanArray = Array.from(cekilis.katilanlar);
      if (katilanArray.length === 0) {
        return interaction.reply({ content: '👥 Çekilişe kimse katılmadı.', ephemeral: true });
      }

      const kazananlar = [];
      const kazananSayisi = cekilis.kazananSayisi;

      while (kazananlar.length < kazananSayisi && katilanArray.length > 0) {
        const secilen = katilanArray.splice(Math.floor(Math.random() * katilanArray.length), 1)[0];
        kazananlar.push(`<@${secilen}>`);
      }

      const embed = EmbedBuilder.from(interaction.message.embeds[0])
        .setTitle('🎉 Çekiliş Yeniden Çekildi!')
        .setDescription(`**Yeni Kazananlar:**\n${kazananlar.join('\n')}`);

      await interaction.message.edit({ embeds: [embed] });

      await interaction.channel.send(`🎉 **Çekiliş Yeniden Çekildi!**\nKazananlar:\n${kazananlar.join('\n')}`);

      return interaction.reply({ content: '✅ Kazananlar başarıyla yenilendi.', ephemeral: true });
    }

    case 'cekilis_iptal': {
      if (!isAdmin) {
        return interaction.reply({ content: '❌ Bu işlemi sadece yöneticiler yapabilir.', ephemeral: true });
      }

      cekilisler.delete(interaction.message.id);

      try {
        await interaction.message.delete();
      } catch (e) {
        return interaction.reply({ content: '⚠️ Mesaj silinirken bir hata oluştu.', ephemeral: true });
      }

      return interaction.reply({ content: '🚫 Çekiliş iptal edildi.', ephemeral: true });
    }

    default:
      return;
  }
};
