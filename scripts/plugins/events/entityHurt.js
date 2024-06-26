import { Player } from '@minecraft/server';
import config from '../../config/main';
import { bounties } from '../../config/main';
import { CX } from '../../API/CX';
CX.Build(CX.BuildTypes['@event'], {
    data: 'EntityHurt',
    executes(data) {
        if (config.damageIndicators)
            CX.extra.indicator(data.hurtEntity, `§c§l${(data.damage / 2).toFixed(1)}`, [0, -0.1, 0], [CX.extra.random(-1, 1), 0.5, CX.extra.random(-1, 1)]);
    }
});
CX.Build(CX.BuildTypes['@event'], {
    data: 'EntityHurt',
    executes(data) {
        const died = data.hurtEntity;
        const damager = data.damageSource.damagingEntity;
        if (died instanceof Player && damager instanceof Player) {
            const hitEntity = CX.player.convert(died), damagingEntity = CX.player.convert(damager)
            if (damagingEntity.score.getScore('inCombat') < 1) damagingEntity.onScreenDisplay.setActionBar('§cYou are now in combat');
            damagingEntity.addTag('inCombat');
            damagingEntity.score.setScore('inCombat', 10);
            if (hitEntity.score.getScore('inCombat') < 1) hitEntity.onScreenDisplay.setActionBar('§cYou are now in combat');
            hitEntity.addTag('inCombat');
            hitEntity.score.setScore('inCombat', 10);
        }
        if (!died instanceof Player && !damager instanceof Player)
            return;
        if (damager && !died.getComponent('health').currentValue <= 0)
            return;
        bounties.forEach((k, index) => {
            if (k.target.id == died.id) {
                if (damager.id == k?.setter?.id)
                    return;
                CX.send(`§r§c§l${damager.name} has claimed ${k.target.name}§r§c§l Bounty of $${CX.extra.parseNumber(k.amount)}!`);
                CX.scoreboard.add(damager, config.currency, k.amount);
                delete bounties[index];
            }
        });
    }
});

CX.Build(CX.BuildTypes['@event'], {
    data: 'EntityHurt',
    executes(data) {
        const died = data.hurtEntity;
        const damager = data.damageSource.damagingEntity;
        if (!died instanceof Player && !damager instanceof Player) return;
        if (damager && !died.getComponent('health').currentValue <= 0) return;
        CX.scoreboard.add(damager, 'kills', 1)
    }
});