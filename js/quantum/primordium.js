const PRIM = {
    unl() { return hasTree('unl2') },
    getTheorems() {
        let b = tmp.prim.t_base
        let x = player.qu.bp.max(1).log(b).mul(2).scale(150,2,true).div(player.dim_shard >= 6 ? tmp.dim.boost.pt : 1)
        return x.floor()
    },
    getNextTheorem() {
        let b = tmp.prim.t_base
        let x = E(b).pow(player.qu.prim.theorems.mul(player.dim_shard >= 6 ? tmp.dim.boost.pt : 1).scale(150,2).div(2).add(1))

        return x
    },
    spentTheorems() {
        let x = E(0)
        for (let i = 0; i < player.qu.prim.particles.length; i++) {
            if (!hasTree('qu_qol11') || i >= 4) x = x.add(player.qu.prim.particles[i])
        }
        return x
    },
    particle: {
        names: ["Delta [Δ]","Alpha [Α]","Omega [Ω]","Sigma [Σ]","Phi [Φ]","Epsilon [Ε]","Theta [Θ]","Beta [Β]"],
        weight: [6,6,6,6,2,2,2,1],
        total_w: 31,
        chance: [],

        eff: [
            p=>{
                let x = p.add(1).root(2)
                return x
            },
            p=>{
                let x = [p.root(3).div(5).add(1),p.pow(1.25).add(1)]
                return x
            },
            p=>{
                let x = [p.root(3).div(5).add(1),E(3).pow(p.pow(0.75))]
                return x
            },
            p=>{
                let x = [p.root(3).div(5).add(1),E(2).pow(p.pow(0.75))]
                return x
            },
            p=>{
                let x = p.add(1).root(10)
                return x
            },
            p=>{
                let x = [p.root(3).div(10), p.root(3).pow(QCs.active()?2:1)]
                return x
            },
            p=>{
                let x = [E(5).pow(p.pow(0.75)), p.root(5).div(10).add(1)]
                return x
            },
            p=>{
                if (hasElement(107)) p = p.mul(2)
                let x = p.pow(0.9).mul(2)
                return x
            },
        ],
        effDesc: [
            x=>{ return `Boost Stronger Power by ${format(x)}x` },
            x=>{ return `Boost Rage Powers gain by ^${format(x[0])} /<br> Boost Non-Bonus Tickspeed by ${format(x[1])}x` },
            x=>{ return `Boost Dark Matters gain by ^${format(x[0])} /<br> Boost BH Condenser Power by ${format(x[1])}x` },
            x=>{ return `Boost Atoms gain by ^${format(x[0])} /<br> Boost Cosmic Ray Power by ${format(x[1])}x` },
            x=>{ return `Boost Higgs Boson's effect by ${format(x)}x` },
            x=>{ return `Add ${format(x[0])} to base from Fermions gain ` + (hasTree("prim3") ? ` /<br> Add ${format(x[1])} free tiers to Fermions` : "") },
            x=>{ return `Boost all Radiations gains by ${format(x[0])}x` + (hasTree("prim2") ? ` /<br> Make all Radiations effects ${format(x[1])}x stronger` : "") },
            x=>{ return `Make all Supernova's scalings start ${format(x)} later` },
        ],
    },
}

function giveRandomPParticles(v, max=false) {
    if (!PRIM.unl()) return

    let s = max?tmp.prim.unspent:E(v)
    if (!max) s = s.min(tmp.prim.unspent)

    let tw = tmp.prim.total_w
    let s_div = s.div(tw).floor()
    let sm = s.mod(tw).floor().toNumber()

    for (let x in PRIM.particle.names) player.qu.prim.particles[x] = player.qu.prim.particles[x].add(s_div.mul(tmp.prim.w[x]))
    for (let x = 0; x < sm; x++) {
        let c = Math.random()
        for (let y in PRIM.particle.chance) if (c <= PRIM.particle.chance[y]) {
            player.qu.prim.particles[y] = player.qu.prim.particles[y].add(1)
            break
        }
    }

    updatePrimordiumTemp()
}

function respecPParticles() {
    createConfirm("Are you sure you want to respec all Particles?",'respectPPs',_=>{
        for (let i =0; i < 8; i++) player.qu.prim.particles[i] = E(0)
        QUANTUM.doReset()
    })
}

function calcPartChances() {
    var sum = 0
    for (let x in PRIM.particle.names) {
        sum += tmp.prim.w[x]
        PRIM.particle.chance[x] = sum / tmp.prim.total_w
    }
}

function updatePrimordiumTemp() {
    let tp = tmp.prim

    tp.parts = []
    tp.t_base = E(5)
    if (hasTree('prim1')) tp.t_base = tp.t_base.sub(1)

    tp.w = [6,6,6,6,2,2,2,1]
    tp.total_w = 31

    if (hasTree('qu_qol11')) {
        tp.w = [0,0,0,0,2,2,2,1]
        tp.total_w -= 24
    }

    let pt = player.qu.prim.theorems

    tp.theorems = PRIM.getTheorems()
    tp.next_theorem = PRIM.getNextTheorem()
    tp.spent_theorem = PRIM.spentTheorems()
    tp.unspent = pt.sub(tp.spent_theorem).max(0)
    for (let i = 0; i < player.qu.prim.particles.length; i++) {
        let pp = player.qu.prim.particles[i]
        if (hasTree('qu_qol11') && i < 4) pp = pt

        tp.parts[i] = pp
        if (hasPrestige(1,4)) pp = pp.add(5)
        if (player.qu.rip.active) pp = pp.mul(i==5?hasElement(95)?0.1:0:1/2)
        tp.eff[i] = PRIM.particle.eff[i](pp.softcap(100,0.75,0))
    }

    calcPartChances()
}

function updatePrimordiumHTML() {
    tmp.el.prim_theorem.setTxt(format(tmp.prim.unspent,0)+" / "+format(player.qu.prim.theorems,0))
    tmp.el.prim_next_theorem.setTxt(format(player.qu.bp,1)+" / "+format(tmp.prim.next_theorem,1))
    for (let i = 0; i < player.qu.prim.particles.length; i++) {
        tmp.el["prim_part"+i].setTxt(format(tmp.prim.parts[i],0))
        tmp.el["prim_part_eff"+i].setHTML(PRIM.particle.effDesc[i](tmp.prim.eff[i]))
    }
}