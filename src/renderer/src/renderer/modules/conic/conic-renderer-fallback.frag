#version 300 es
#define SHADER_NAME Conic-Renderer-Shader

precision mediump float;

uniform sampler2D uSamplers[%texturesPerBatch%];

in vec2 vWorldCoord;
in vec2 vTextureCoord;
in float vMasterID;
in float vUniformID;

out vec4 fragmentColor;

uniform vec3 k[%uniformsPerBatch%];
uniform vec3 l[%uniformsPerBatch%];
uniform vec3 m[%uniformsPerBatch%];
uniform vec3 uColor[%uniformsPerBatch%];
uniform vec3 uTint[%uniformsPerBatch%];
uniform bool inside;

void main(void)
{
    vec3 kv, lv, mv;

    for (int i = 0; i < %uniformsPerBatch%; i++)
    {
        if (float(i) > vUniformID - 0.5) 
        {
            kv = k[i];
            lv = l[i];
            mv = m[i];
            break;
        }
    }

    float k_ = dot(vec3(vTextureCoord, 1), kv);
    float l_ = dot(vec3(vTextureCoord, 1), lv);
    float m_ = dot(vec3(vTextureCoord, 1), mv);

    float cv = k_ * k_ - l_ * m_;

    vec4 color;

    if ((inside && cv < 0.) || (!inside && cv >= 0.))
    {
        for (int i = 0; i < %texturesPerBatch%; i++)
        {
            if (float(i) > vMasterID - 0.5)
            {
                color = vec4(uColor[i] * uTint[i], 1.0);
                break;
            }
        }
    }
    else
    {
        color = vec4(0, 0, 0, 0);
    }

    fragmentColor = color;
}