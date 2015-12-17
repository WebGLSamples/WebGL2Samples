#version 150 core

precision highp float;
precision highp int;
layout(std140) uniform;

uniform material
{
	vec4 Diffuse[2];
} Material;

in block
{
	flat int Instance;
} In;

out vec4 Color;

void main()
{
	Color = Material.Diffuse[In.Instance];
}
