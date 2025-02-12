import { NodeType } from "./types";
import { Position } from "@xyflow/react";

export const initialNodes = [
  { id: '1', position: { x: 13, y: 20 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '1a',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '1b',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '1c',
      position: Position.Right,
    },
    {
      type: 'source',
      id: '1d',
      position: Position.Right,
    },
  ] }, type: NodeType.DropZone },
  { id: '2', position: { x: 703, y: 10 }, data: { label: 'Power', handles: [
    {
      type: 'source',
      id: '2a',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '2b',
      position: Position.Bottom,
    },
  ] }, type: NodeType.Static },
  { id: '3', position: { x: 380, y: 50 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '3a',
      position: Position.Left,
    },
    {
      type: 'target',
      id: '3b',
      position: Position.Bottom,
    },
    {
      type: 'source',
      id: '3c',
      position: Position.Right,
    },
  ] }, type: NodeType.DropZone },
  { id: '4', position: { x: 7, y: 162 }, data: { label: 'Joules', handles: [
    {
      type: 'source',
      id: '4a',
      position: Position.Top,
    },
    {
      type: 'source',
      id: '4b',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '4c',
      position: Position.Right,
    },
    {
      type: 'source',
      id: '4d',
      position: Position.Bottom,
    },
  ] }, type: NodeType.Static },
  { id: '5', position: { x: 370, y: 200 }, data: { label: 'Energy', handles: [
    {
      type: 'source',
      id: '5a',
      position: Position.Top,
    },
    {
      type: 'source',
      id: '5b',
      position: Position.Left,
    },
    {
      type: 'source',
      id: '5c',
      position: Position.Right,
    },
  ] }, type: NodeType.Static },
  { id: '6', position: { x: 715, y: 180 }, data: { label: 'Force', handles: [
    {
      type: 'source',
      id: '6a',
      position: Position.Top,
    },
    {
      type: 'source',
      id: '6b',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '6c',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '6d',
      position: Position.Bottom,
    },
    
  ] }, type: NodeType.Static },
  { id: '8', position: { x: 461, y: 386 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '8a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '8b',
      position: Position.Top,
    },
  ] }, type: NodeType.DropZone },
  { id: '9', position: { x: 720, y: 317 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '9a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '9b',
      position: Position.Top,
    },
  ] }, type: NodeType.DropZone },
  { id: '10', position: { x: 88, y: 415 }, data: { label: '= mgΔh', handles: [
    {
      type: 'source',
      id: '10a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '10b',
      position: Position.Top,
    },
  ] }, type: NodeType.Static },
  { id: '7', position: { x: 50, y: 296 }, data: { label: 'Kinetic Energy', handles: [
    {
      type: 'source',
      id: '7a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '7b',
      position: Position.Right,
    },
  ] }, type: NodeType.Static },
];

export const initialEdges = [
  { id: 'e4-1', type: "custom-edge", source: '4', target: '1', data: { label: 'Usually measured in food with this unit' }, targetHandle: "1b" },
  { id: 'e3-4', type: "custom-edge", source: '3', target: '4', data: { label: 'SI Unit is' }, sourceHandle: "3a" },
  { id: 'e5-3', type: "custom-edge", source: '5', target: '3', data: { label: 'the ability to do' } },
  { id: 'e3-6', type: "custom-edge", source: '3', target: '6', data: { label: 'is done when' }, sourceHandle: "3c" },
  { id: 'e6-2', type: "custom-edge", source: '6', target: '2', data: { label: 'x Constant Velocity =' } },
  { id: 'e6-9', type: "custom-edge", source: '6', target: '9', data: { label: 'acts through' }, sourceHandle: "6b" },
  { id: 'e5-7', type: "custom-edge", source: '5', target: '7', data: { label: 'can be of type' }, sourceHandle: "5b",  },
  { id: 'e5-8', type: "custom-edge", source: '5', target: '8', data: { label: 'can be of type' }, sourceHandle: "5c",},
];
