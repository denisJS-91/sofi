export function monitorDrift(core, text) {

    if (!text) return;

    let drift = 0;

    const checks = [

        /as an ai/gi,
        /language model/gi,
        /translation:/gi,
        /dear user/gi,
        /i cannot/gi,
        /i do not have feelings/gi,
        /\(hello!/gi,
        /\(translation/gi

    ];

    for (const pattern of checks) {
        if (pattern.test(text)) {
            drift += 1;
        }
    }

    // слишком длинный ответ
    if (text.length > 700) {
        drift += 1;
    }

    // обновляем stability
    core.identity.stability -= drift * 0.05;

    // clamp
    if (core.identity.stability < 0) {
        core.identity.stability = 0;
    }

    // self model
    core.selfModel.consistencyErrors += drift;

    return drift;
}